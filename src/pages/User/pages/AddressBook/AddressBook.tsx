import { useState, useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  MeasuringStrategy
} from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { toast } from 'react-toastify'
import addressApi from 'src/apis/address.api'
import { Address, AddressType } from 'src/types/checkout.type'
import AddressForm from 'src/components/AddressSelector/AddressForm'
import Button from 'src/components/Button'
import ShopeeCheckbox from 'src/components/ShopeeCheckbox'

type FilterType = 'all' | AddressType

const ADDRESS_TYPE_CONFIG: Record<AddressType, { label: string; icon: React.ReactNode; color: string }> = {
  home: {
    label: 'Nhà riêng',
    color: 'blue',
    icon: (
      <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
        <path d='M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' />
      </svg>
    )
  },
  office: {
    label: 'Văn phòng',
    color: 'purple',
    icon: (
      <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
        <path
          fillRule='evenodd'
          d='M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z'
          clipRule='evenodd'
        />
      </svg>
    )
  },
  other: {
    label: 'Khác',
    color: 'gray',
    icon: (
      <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
        <path
          fillRule='evenodd'
          d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
          clipRule='evenodd'
        />
      </svg>
    )
  }
}

const AddressBook = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor)
  )

  const { data: addressData, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await addressApi.getAddresses()
      return res.data.data
    }
  })

  const rawAddresses = addressData?.addresses || []

  const [orderedAddresses, setOrderedAddresses] = useState<Address[]>([])

  useMemo(() => {
    if (rawAddresses.length > 0 && orderedAddresses.length === 0) {
      setOrderedAddresses(rawAddresses)
    } else if (rawAddresses.length !== orderedAddresses.length) {
      const newIds = new Set(rawAddresses.map((a) => a._id))
      const existingIds = new Set(orderedAddresses.map((a) => a._id))
      const addedAddresses = rawAddresses.filter((a) => !existingIds.has(a._id))
      const remainingAddresses = orderedAddresses.filter((a) => newIds.has(a._id))
      setOrderedAddresses([...addedAddresses, ...remainingAddresses])
    }
  }, [rawAddresses])

  const filteredAddresses = useMemo(() => {
    let result = orderedAddresses.length > 0 ? orderedAddresses : rawAddresses

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (addr) =>
          addr.fullName.toLowerCase().includes(query) ||
          addr.phone.includes(query) ||
          addr.street.toLowerCase().includes(query) ||
          addr.district.toLowerCase().includes(query) ||
          addr.province.toLowerCase().includes(query)
      )
    }

    if (filterType !== 'all') {
      result = result.filter((addr) => (addr.addressType || 'home') === filterType)
    }

    return result
  }, [orderedAddresses, rawAddresses, searchQuery, filterType])

  const defaultAddress = filteredAddresses.find((addr) => addr.isDefault)
  const otherAddresses = filteredAddresses.filter((addr) => !addr.isDefault)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Xóa địa chỉ thành công', { autoClose: 1000, position: 'top-center' })
      setDeletingAddressId(null)
    }
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => addressApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Đặt địa chỉ mặc định thành công', { autoClose: 1000, position: 'top-center' })
    }
  })

  const handleAddNew = useCallback(() => {
    setEditingAddress(null)
    setShowForm(true)
  }, [])

  const handleEdit = useCallback((address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }, [])

  const handleFormClose = useCallback(() => {
    setShowForm(false)
    setEditingAddress(null)
  }, [])

  const handleFormSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['addresses'] })
    setShowForm(false)
    setEditingAddress(null)
    toast.success(editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công', {
      autoClose: 1000,
      position: 'top-center'
    })
  }, [queryClient, editingAddress])

  const handleDelete = useCallback((id: string) => {
    setDeletingAddressId(id)
  }, [])

  const confirmDelete = useCallback(() => {
    if (deletingAddressId) {
      deleteMutation.mutate(deletingAddressId)
    }
  }, [deletingAddressId, deleteMutation])

  const handleSetDefault = useCallback(
    (id: string) => {
      setDefaultMutation.mutate(id)
    },
    [setDefaultMutation]
  )

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    const nonDefaultIds = filteredAddresses.filter((a) => !a.isDefault).map((a) => a._id)
    if (selectedIds.size === nonDefaultIds.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(nonDefaultIds))
    }
  }, [filteredAddresses, selectedIds.size])

  const handleBulkDelete = useCallback(() => {
    setShowBulkDeleteConfirm(true)
  }, [])

  const confirmBulkDelete = useCallback(async () => {
    const idsToDelete = Array.from(selectedIds)
    for (const id of idsToDelete) {
      await deleteMutation.mutateAsync(id)
    }
    setSelectedIds(new Set())
    setIsSelectionMode(false)
    setShowBulkDeleteConfirm(false)
    toast.success(`Đã xóa ${idsToDelete.length} địa chỉ`, { autoClose: 1000, position: 'top-center' })
  }, [selectedIds, deleteMutation])

  const handleReorder = useCallback((newOrder: Address[]) => {
    setOrderedAddresses(newOrder)
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (over && active.id !== over.id) {
        const oldIndex = otherAddresses.findIndex((addr) => addr._id === active.id)
        const newIndex = otherAddresses.findIndex((addr) => addr._id === over.id)
        const newOrder = arrayMove(otherAddresses, oldIndex, newIndex)
        const newFullOrder = defaultAddress ? [defaultAddress, ...newOrder] : newOrder
        handleReorder(newFullOrder)
      }
    },
    [otherAddresses, defaultAddress, handleReorder]
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  const activeAddress = activeId ? otherAddresses.find((addr) => addr._id === activeId) : null

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.ward}, ${address.district}, ${address.province}`
  }

  const getAddressTypeInfo = (type?: AddressType) => {
    return ADDRESS_TYPE_CONFIG[type || 'home']
  }

  const addressCounts = useMemo(() => {
    const counts: Record<FilterType, number> = { all: rawAddresses.length, home: 0, office: 0, other: 0 }
    rawAddresses.forEach((addr) => {
      const type = addr.addressType || 'home'
      counts[type]++
    })
    return counts
  }, [rawAddresses])

  if (isLoading) {
    return (
      <div className='rounded-md bg-white px-2 pb-10 shadow-sm md:px-7 md:pb-20 dark:bg-slate-800'>
        <div className='flex h-64 items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-orange border-t-transparent dark:border-orange-400'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-md bg-white px-2 pb-10 shadow-sm md:px-7 md:pb-20 dark:bg-slate-800'>
      <Helmet>
        <title>Địa chỉ của tôi | Shopee Clone</title>
        <meta name='description' content='Quản lý địa chỉ giao hàng của bạn' />
      </Helmet>
      {/* Header */}
      <div className='flex flex-col gap-4 border-b border-b-gray-100 py-6 sm:flex-row sm:items-center sm:justify-between dark:border-b-slate-600'>
        <div className='text-center sm:text-left'>
          <h1 className='text-lg font-medium text-gray-700 capitalize dark:text-gray-200'>Địa chỉ của tôi</h1>
          <div className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Quản lý địa chỉ giao hàng của bạn ({rawAddresses.length} địa chỉ)
          </div>
        </div>
        <div className='flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3'>
          {rawAddresses.length > 0 && (
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode)
                setSelectedIds(new Set())
              }}
              className={`group relative flex h-9 items-center justify-center gap-1.5 overflow-hidden rounded-xl px-3 text-xs font-medium transition-all duration-300 sm:h-10 sm:gap-2 sm:px-5 sm:text-sm ${
                isSelectionMode
                  ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange/25'
                  : 'bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
              }`}
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
              <span>{isSelectionMode ? 'Hủy chọn' : 'Chọn nhiều'}</span>
            </button>
          )}
          <button
            onClick={handleAddNew}
            className='group relative flex h-9 items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-linear-to-r from-orange-500 via-orange-500 to-orange-600 px-3 text-xs font-medium text-white shadow-lg shadow-orange/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange/40 sm:h-10 sm:gap-2 sm:px-5 sm:text-sm'
          >
            <span className='absolute inset-0 bg-linear-to-r from-orange-600 via-orange-600 to-orange-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
            <svg
              className='relative z-10 h-4 w-4 transition-transform duration-300 group-hover:rotate-90'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            <span className='relative z-10'>Thêm địa chỉ mới</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      {rawAddresses.length > 0 && (
        <div className='mt-6 space-y-4'>
          {/* Search Box */}
          <div className='relative'>
            <svg
              className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            <input
              type='text'
              placeholder='Tìm kiếm theo tên, số điện thoại, địa chỉ...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 text-sm transition-colors focus:border-orange focus:ring-1 focus:ring-orange/30 focus:outline-hidden dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100 dark:focus:border-orange-400 dark:focus:ring-orange-400/30'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className='flex flex-wrap gap-2'>
            {(['all', 'home', 'office', 'other'] as FilterType[]).map((type) => {
              const isActive = filterType === type
              const count = addressCounts[type]
              const config = type === 'all' ? null : ADDRESS_TYPE_CONFIG[type]
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange text-white shadow-md dark:bg-orange-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {config && <span className={isActive ? 'text-white' : ''}>{config.icon}</span>}
                  {type === 'all' ? 'Tất cả' : config?.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-slate-600'}`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {isSelectionMode && selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className='flex flex-col gap-3 rounded-lg bg-orange/5 p-3 sm:flex-row sm:items-center sm:justify-between dark:bg-orange-400/10'
              >
                <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
                  <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                    <ShopeeCheckbox
                      checked={selectedIds.size === filteredAddresses.filter((a) => !a.isDefault).length}
                      onChange={handleSelectAll}
                      size='sm'
                    />
                    <span
                      className='cursor-pointer hover:text-orange dark:hover:text-orange-400'
                      onClick={handleSelectAll}
                    >
                      Chọn tất cả
                    </span>
                  </div>
                  <span className='text-xs text-gray-500 sm:text-sm dark:text-gray-400'>
                    Đã chọn {selectedIds.size} địa chỉ
                  </span>
                </div>
                <Button
                  onClick={handleBulkDelete}
                  className='flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 sm:w-auto'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                  Xóa đã chọn
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Address List */}
      <div className='mt-6'>
        {rawAddresses.length === 0 ? (
          <EmptyState onAddNew={handleAddNew} />
        ) : filteredAddresses.length === 0 ? (
          <NoResultsState
            searchQuery={searchQuery}
            filterType={filterType}
            onClear={() => {
              setSearchQuery('')
              setFilterType('all')
            }}
          />
        ) : (
          <div className='space-y-6'>
            {/* Default Address - Always on top */}
            {defaultAddress && (
              <div>
                <h3 className='mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400'>
                  <svg className='h-4 w-4 text-orange dark:text-orange-400' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Địa chỉ mặc định
                </h3>
                <AddressCard
                  address={defaultAddress}
                  isDefault
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                  formatAddress={formatAddress}
                  getAddressTypeInfo={getAddressTypeInfo}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedIds.has(defaultAddress._id)}
                  onToggleSelect={handleToggleSelect}
                />
              </div>
            )}

            {/* Other Addresses - Reorderable Grid */}
            {otherAddresses.length > 0 && (
              <div>
                <h3 className='mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400'>
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  Địa chỉ khác ({otherAddresses.length})
                  {!isSelectionMode && <span className='ml-auto text-xs text-gray-400'>Kéo thả để sắp xếp</span>}
                </h3>
                <DndContext
                  sensors={isSelectionMode ? [] : sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                  modifiers={[restrictToWindowEdges]}
                  measuring={{
                    droppable: {
                      strategy: MeasuringStrategy.Always
                    }
                  }}
                >
                  <SortableContext items={otherAddresses.map((addr) => addr._id)} strategy={rectSortingStrategy}>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
                      {otherAddresses.map((address) => (
                        <SortableAddressCard
                          key={address._id}
                          address={address}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onSetDefault={handleSetDefault}
                          formatAddress={formatAddress}
                          getAddressTypeInfo={getAddressTypeInfo}
                          isSelectionMode={isSelectionMode}
                          isSelected={selectedIds.has(address._id)}
                          onToggleSelect={handleToggleSelect}
                          isDragging={activeId === address._id}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay
                    dropAnimation={{
                      duration: 300,
                      easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
                    }}
                    modifiers={[restrictToWindowEdges]}
                  >
                    {activeAddress && (
                      <div className='scale-105 rotate-2 shadow-2xl'>
                        <AddressCard
                          address={activeAddress}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onSetDefault={handleSetDefault}
                          formatAddress={formatAddress}
                          getAddressTypeInfo={getAddressTypeInfo}
                          isSelectionMode={false}
                          isSelected={false}
                          onToggleSelect={handleToggleSelect}
                        />
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && <AddressForm address={editingAddress} onClose={handleFormClose} onSuccess={handleFormSuccess} />}
      </AnimatePresence>

      <AnimatePresence>
        {deletingAddressId && (
          <DeleteConfirmModal
            onConfirm={confirmDelete}
            onCancel={() => setDeletingAddressId(null)}
            isLoading={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <DeleteConfirmModal
            onConfirm={confirmBulkDelete}
            onCancel={() => setShowBulkDeleteConfirm(false)}
            isLoading={deleteMutation.isPending}
            title={`Xóa ${selectedIds.size} địa chỉ`}
            message={`Bạn có chắc chắn muốn xóa ${selectedIds.size} địa chỉ đã chọn? Hành động này không thể hoàn tác.`}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface AddressCardProps {
  address: Address
  isDefault?: boolean
  onEdit: (address: Address) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
  formatAddress: (address: Address) => string
  getAddressTypeInfo: (type?: AddressType) => { label: string; icon: React.ReactNode; color: string }
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
}

const AddressCard = ({
  address,
  isDefault,
  onEdit,
  onDelete,
  onSetDefault,
  formatAddress,
  getAddressTypeInfo,
  isSelectionMode,
  isSelected,
  onToggleSelect
}: AddressCardProps) => {
  const typeInfo = getAddressTypeInfo(address.addressType)
  const displayLabel = address.addressType === 'other' && address.label ? address.label : typeInfo.label

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-700'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-700'
    },
    gray: {
      bg: 'bg-gray-100 dark:bg-slate-700',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-slate-600'
    }
  }
  const typeColors = colorClasses[typeInfo.color] || colorClasses.gray

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      className={`group relative h-full overflow-hidden rounded-xl border p-3 transition-all duration-200 sm:p-5 ${
        isSelected
          ? 'border-orange bg-orange/5 ring-2 ring-orange/20 dark:border-orange-400 dark:bg-orange-400/10 dark:ring-orange-400/20'
          : isDefault
            ? 'border-orange bg-linear-to-br from-orange/5 to-orange/10 shadow-md dark:border-orange-400 dark:from-orange-400/10 dark:to-orange-400/20'
            : 'border-gray-200 bg-linear-to-br from-white via-gray-50/50 to-blue-50/30 shadow-xs hover:border-blue-200 hover:from-white hover:via-blue-50/30 hover:to-indigo-50/30 hover:shadow-lg dark:border-slate-600 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 dark:hover:border-slate-500 dark:hover:from-slate-700 dark:hover:via-slate-700 dark:hover:to-slate-600'
      }`}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && !isDefault && (
        <div className='absolute top-3 left-3 z-10' onClick={(e) => e.stopPropagation()}>
          <ShopeeCheckbox checked={!!isSelected} onChange={() => onToggleSelect?.(address._id)} size='sm' />
        </div>
      )}

      {/* Default badge ribbon */}
      {isDefault && (
        <div className='absolute top-3 -right-8 rotate-45 bg-orange px-10 py-1 text-xs font-medium text-white shadow-xs'>
          Mặc định
        </div>
      )}

      {/* Drag handle indicator */}
      {!isSelectionMode && !isDefault && (
        <div className='absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100'>
          <svg className='h-5 w-5 text-gray-400 dark:text-gray-500' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z' />
          </svg>
        </div>
      )}

      {/* Address Content */}
      <div className={`flex items-start gap-3 sm:gap-4 ${isSelectionMode && !isDefault ? 'ml-8' : ''}`}>
        {/* Address Type Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors sm:h-12 sm:w-12 ${
            isDefault
              ? 'bg-orange text-white dark:bg-orange-400'
              : `${typeColors.bg} ${typeColors.text} group-hover:bg-orange/10 group-hover:text-orange dark:group-hover:bg-orange-400/20 dark:group-hover:text-orange-400`
          }`}
        >
          {typeInfo.icon}
        </div>

        <div className='min-w-0 flex-1'>
          {/* Name and Phone */}
          <div className='flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2'>
            <h3 className='min-w-0 truncate bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-sm font-semibold text-transparent sm:text-base dark:from-gray-100 dark:to-gray-300'>
              {address.fullName}
            </h3>
            <span className='hidden shrink-0 text-gray-300 sm:inline dark:text-gray-500'>|</span>
            <span className='flex shrink-0 items-center gap-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400'>
              <svg className='h-3.5 w-3.5 sm:h-4 sm:w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                />
              </svg>
              {address.phone}
            </span>
          </div>

          {/* Address */}
          <p className='mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-700 sm:mt-2 sm:text-sm dark:text-gray-300'>
            {formatAddress(address)}
          </p>

          {/* Tags */}
          <div className='mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2'>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium sm:px-2.5 ${typeColors.bg} ${typeColors.text}`}
            >
              <span className='mr-1 flex h-3 w-3 items-center justify-center [&>svg]:h-3 [&>svg]:w-3'>
                {typeInfo.icon}
              </span>
              {displayLabel}
            </span>
            {isDefault && (
              <span className='inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 sm:px-2.5'>
                <svg className='mr-1 h-3 w-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                Địa chỉ giao hàng
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {!isSelectionMode && (
        <div className='mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:pt-4 dark:border-slate-600'>
          <div className='flex items-center gap-2'>
            {!isDefault && (
              <button
                onClick={() => onSetDefault(address._id)}
                className='inline-flex items-center gap-1 rounded-lg border border-orange/30 bg-orange/5 px-2.5 py-1.5 text-xs font-medium text-orange transition-all hover:border-orange hover:bg-orange hover:text-white! sm:gap-1.5 sm:px-3 sm:text-sm dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-400 dark:hover:border-orange-400 dark:hover:bg-orange-400 dark:hover:text-white!'
              >
                <svg className='h-3.5 w-3.5 sm:h-4 sm:w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
                Đặt mặc định
              </button>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => onEdit(address)}
              className='inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:gap-1.5 sm:px-3 sm:text-sm dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
            >
              <svg className='h-3.5 w-3.5 sm:h-4 sm:w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                />
              </svg>
              Sửa
            </button>
            {!isDefault && (
              <button
                onClick={() => onDelete(address._id)}
                className='inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 sm:gap-1.5 sm:px-3 sm:text-sm dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
              >
                <svg className='h-3.5 w-3.5 sm:h-4 sm:w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
                Xóa
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

interface SortableAddressCardProps extends AddressCardProps {
  isDragging?: boolean
}

const SortableAddressCard = ({ isDragging, ...props }: SortableAddressCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting
  } = useSortable({
    id: props.address._id,
    disabled: props.isSelectionMode,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSorting ? 0.4 : 1,
    zIndex: isDragging || isSorting ? 50 : 'auto'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${props.isSelectionMode ? '' : 'cursor-grab active:cursor-grabbing'} ${isDragging || isSorting ? 'ring-2 ring-orange/30 ring-offset-2' : ''} transition-shadow duration-200`}
      {...(props.isSelectionMode ? {} : { ...attributes, ...listeners })}
    >
      <AddressCard {...props} />
    </div>
  )
}

interface EmptyStateProps {
  onAddNew: () => void
}

const EmptyState = ({ onAddNew }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-linear-to-b from-gray-50 to-white py-16 dark:border-slate-600 dark:from-slate-900 dark:to-slate-800'
    >
      {/* Animated location icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className='relative'
      >
        <div className='flex h-24 w-24 items-center justify-center rounded-full bg-orange/10 dark:bg-orange-400/20'>
          <svg
            className='h-12 w-12 text-orange dark:text-orange-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
            />
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
          </svg>
        </div>
        {/* Decorative dots */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className='absolute -top-2 -right-2 h-4 w-4 rounded-full bg-orange/30 dark:bg-orange-400/40'
        />
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          className='absolute -bottom-1 -left-3 h-3 w-3 rounded-full bg-blue-300/50 dark:bg-blue-400/40'
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className='mt-6 text-center'
      >
        <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-100'>Chưa có địa chỉ nào</h3>
        <p className='mx-auto mt-2 max-w-xs text-sm text-gray-500 dark:text-gray-400'>
          Thêm địa chỉ giao hàng để việc mua sắm trở nên nhanh chóng và thuận tiện hơn
        </p>
      </motion.div>

      {/* Features list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-500 dark:text-gray-400'
      >
        <span className='flex items-center gap-1'>
          <svg className='h-4 w-4 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
          Giao hàng nhanh
        </span>
        <span className='flex items-center gap-1'>
          <svg className='h-4 w-4 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
          Lưu nhiều địa chỉ
        </span>
        <span className='flex items-center gap-1'>
          <svg className='h-4 w-4 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
          Thanh toán dễ dàng
        </span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Button
          onClick={onAddNew}
          className='mt-8 flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange to-orange/90 px-8 text-sm font-medium text-white shadow-lg shadow-orange/30 transition-all hover:shadow-xl hover:shadow-orange/40 dark:from-orange-400 dark:to-orange-500 dark:shadow-orange-400/30 dark:hover:shadow-orange-400/40'
        >
          <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          Thêm địa chỉ đầu tiên
        </Button>
      </motion.div>
    </motion.div>
  )
}

interface DeleteConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
  title?: string
  message?: string
}

const DeleteConfirmModal = ({
  onConfirm,
  onCancel,
  isLoading,
  title = 'Xóa địa chỉ',
  message = 'Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.'
}: DeleteConfirmModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className='w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='mb-4 flex items-center justify-center'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
            <svg
              className='h-6 w-6 text-red-600 dark:text-red-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
              />
            </svg>
          </div>
        </div>
        <h3 className='mb-2 text-center text-lg font-medium text-gray-900 dark:text-gray-100'>{title}</h3>
        <p className='mb-6 text-center text-sm text-gray-500 dark:text-gray-400'>{message}</p>
        <div className='flex gap-3'>
          <Button
            onClick={onCancel}
            className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            className='flex-1 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50'
          >
            Xóa
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface NoResultsStateProps {
  searchQuery: string
  filterType: FilterType
  onClear: () => void
}

const NoResultsState = ({ searchQuery, filterType, onClear }: NoResultsStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 dark:border-slate-600 dark:bg-slate-900'
    >
      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700'>
        <svg className='h-8 w-8 text-gray-400 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
      </div>
      <h3 className='mt-4 text-lg font-medium text-gray-700 dark:text-gray-200'>Không tìm thấy địa chỉ</h3>
      <p className='mt-2 max-w-sm text-center text-sm text-gray-500 dark:text-gray-400'>
        {searchQuery
          ? `Không có địa chỉ nào phù hợp với "${searchQuery}"`
          : `Không có địa chỉ nào thuộc loại "${filterType === 'home' ? 'Nhà riêng' : filterType === 'office' ? 'Văn phòng' : 'Khác'}"`}
      </p>
      <Button
        onClick={onClear}
        className='mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
      >
        Xóa bộ lọc
      </Button>
    </motion.div>
  )
}

export default AddressBook
