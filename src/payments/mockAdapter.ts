import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

export const mockAdapter = (): PaymentAdapter => ({
  name: 'mock',
  label: 'Demo Checkout',
  group: {
    name: 'mock',
    type: 'group',
    admin: {
      condition: (data) => data?.paymentMethod === 'mock',
    },
    fields: [
      {
        name: 'transactionToken',
        type: 'text',
        label: 'Mock Transaction Token',
      },
    ],
  },
  initiatePayment: async ({ data, req, transactionsSlug = 'transactions' }) => {
    const payload = req.payload
    const { cart, customerEmail, billingAddress } = data

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty or not provided.')
    }

    const flattenedCart = cart.items.map((item: any) => {
      const productID = typeof item.product === 'object' ? item.product.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant.id
          : item.variant
        : undefined
      const { product: _product, variant: _variant, ...customProperties } = item
      return {
        ...customProperties,
        product: productID,
        quantity: item.quantity,
        ...(variantID ? { variant: variantID } : {}),
      }
    })

    const transaction = await payload.create({
      collection: transactionsSlug,
      data: {
        ...(req.user ? { customer: req.user.id } : { customerEmail }),
        amount: cart.subtotal || 0,
        billingAddress,
        cart: cart.id,
        currency: 'USD',
        items: flattenedCart,
        paymentMethod: 'mock',
        status: 'pending',
        mock: {
          transactionToken: crypto.randomUUID(),
        },
      },
    })

    return {
      message: 'Order ready to confirm',
      mockTransactionID: transaction.id,
    }
  },
  confirmOrder: async ({
    cartsSlug = 'carts',
    data,
    ordersSlug = 'orders',
    req,
    transactionsSlug = 'transactions',
  }) => {
    const payload = req.payload
    const { mockTransactionID, customerEmail } = data

    if (!mockTransactionID) {
      throw new Error('Mock transaction ID is required')
    }

    const transaction = await payload.findByID({
      collection: transactionsSlug,
      id: mockTransactionID,
    })

    if (!transaction) {
      throw new Error('Transaction not found')
    }

    const order = await payload.create({
      collection: ordersSlug,
      data: {
        amount: transaction.amount,
        currency: transaction.currency,
        ...(req.user
          ? { customer: req.user.id }
          : { customerEmail: customerEmail || transaction.customerEmail }),
        items: transaction.items,
        shippingAddress: transaction.billingAddress,
        status: 'processing',
        transactions: [transaction.id],
      },
    })

    const timestamp = new Date().toISOString()
    await payload.update({
      id: transaction.cart as string,
      collection: cartsSlug,
      data: { purchasedAt: timestamp },
    })

    await payload.update({
      id: transaction.id,
      collection: transactionsSlug,
      data: {
        order: order.id,
        status: 'succeeded',
      },
    })

    return {
      message: 'Order confirmed successfully',
      orderID: order.id,
      transactionID: transaction.id,
      ...(order.accessToken ? { accessToken: order.accessToken } : {}),
    }
  },
})
