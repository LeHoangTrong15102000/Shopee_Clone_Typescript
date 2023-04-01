import React from 'react'
import { useForm } from 'react-hook-form'
import { Schema, schema } from 'src/utils/rules'
import { yupResolver } from '@hookform/resolvers/yup'
import _ from 'lodash'
import useQueryConfig from './useQueryConfig'
import { createSearchParams, useNavigate } from 'react-router-dom'
import path from 'src/constant/path'

type FormData = Pick<Schema, 'name'>

const searchSchema = schema.pick(['name'])
const useSearchProducts = () => {
  const navigate = useNavigate()
  const queryConfig = useQueryConfig()
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: ''
    },
    resolver: yupResolver(searchSchema)
  })
  // function xử lý search product
  const onSubmitSearch = handleSubmit((data) => {
    // console.log(data) data.name là do trên useForm defaultValue là name
    const config = queryConfig.order
      ? _.omit({ ...queryConfig, name: data.name }, ['order', 'sort_by'])
      : { ...queryConfig, name: data.name }
    navigate({
      pathname: path.home,
      search: createSearchParams(config).toString()
    })
    // khi mà search xong thì set nane lại bằng rỗng
  })

  return { onSubmitSearch, register }
}

export default useSearchProducts
