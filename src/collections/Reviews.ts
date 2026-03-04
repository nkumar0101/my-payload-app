import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'
import { publicAccess } from '@/access/publicAccess'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'product', 'rating', 'createdAt'],
  },
  access: {
    create: publicAccess,
    read: () => true,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Not displayed publicly',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
  ],
}
