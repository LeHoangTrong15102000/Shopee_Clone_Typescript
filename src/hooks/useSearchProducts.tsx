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
  // const debounce = useDebounce(name, 500)
  // Phải sử dụng useEffect() để thực hiện việc đebounce gọi Api rồi

  // function xử lý search product
  const onSubmitSearch = handleSubmit((data) => {
    // Sử dụng hook useDebounce()

    // console.log(data) data.name là do trên useForm defaultValue là name
    const config = queryConfig.order
      ? omit({ ...queryConfig, name: data.name }, ['order', 'sort_by'])
      : { ...queryConfig, name: data.name }
    navigate({
      pathname: path.home,
      search: createSearchParams(config).toString() // nó convert cái search này lại thành string
    })
    // khi mà search xong thì set nane lại bằng rỗng
  })

  return { onSubmitSearch, register }
}

export default useSearchProducts
