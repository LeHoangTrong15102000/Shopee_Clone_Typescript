import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Schema, schema } from 'src/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import omit from 'lodash/omit'
import useQueryConfig from './useQueryConfig'
import { createSearchParams, useNavigate } from 'react-router-dom'
import path from 'src/constant/path'

type FormData = Pick<Schema, 'name'>

const searchSchema = schema.pick(['name'])

/**
 * Hook for handling product search with automatic query cancellation
 * Tự động hủy các request search cũ khi có request mới
 */
const useSearchProducts = () => {
  const [searchValue, setSearchValue] = useState('') // khi mà search vào ô tìm kiếm thì sẽ set lại
  const navigate = useNavigate()
  const queryConfig = useQueryConfig()

  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: searchValue
    },
    resolver: yupResolver(searchSchema)
  })

  /**
   * Function xử lý search product với query cancellation support
   * TanStack Query sẽ tự động hủy request cũ khi queryKey thay đổi
   */
  const onSubmitSearch = handleSubmit((data) => {
    // console.log(data) data.name là do trên useForm defaultValue là name
    const config = queryConfig.order
      ? omit({ ...queryConfig, name: data.name }, ['order', 'sort_by'])
      : { ...queryConfig, name: data.name }

    navigate({
      pathname: path.home,
      search: createSearchParams(config).toString() // nó convert cái search này lại thành string
    })

    // Note: TanStack Query sẽ tự động hủy các request đang pending
    // khi queryKey ['products', queryConfig] thay đổi
  })

  return {
    onSubmitSearch,
    register,
    searchValue,
    setSearchValue,
    errors
  }
}

export default useSearchProducts
