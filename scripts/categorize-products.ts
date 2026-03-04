import { getPayload } from 'payload'
import config from '../src/payload.config.js'

// Map each product slug to a category
const productCategories: Record<string, string> = {
  // Electronics
  'airpods': 'Electronics',
  'laptop': 'Electronics',
  'smart-watch': 'Electronics',
  'tablet': 'Electronics',
  'bluetooth-speaker': 'Electronics',

  // Clothing
  'cotton-crew-neck-sweatshirt': 'Clothing',
  'linen-shirt': 'Clothing',
  'hoodie': 'Clothing',
  'denim-jacket': 'Clothing',
  'graphic-t-shirt': 'Clothing',
  'sweatshirt': 'Clothing',

  // Footwear
  'classic-white-sneakers': 'Footwear',
  'sneakers': 'Footwear',

  // Accessories
  'leather-wallet': 'Accessories',
  'canvas-tote-bag': 'Accessories',
  'wool-beanie': 'Accessories',
  'leather-card-holder': 'Accessories',
  'stainless-steel-water-bottle': 'Accessories',

  // Home & Lifestyle
  'ceramic-coffee-mug': 'Home & Lifestyle',
  'scented-soy-candle': 'Home & Lifestyle',
}

async function main() {
  const payload = await getPayload({ config })

  // 1. Collect needed category names
  const neededCategories = [...new Set(Object.values(productCategories))]

  // 2. Fetch existing categories
  const { docs: existingCategories } = await payload.find({
    collection: 'categories',
    limit: 100,
  })

  const categoryMap: Record<string, string> = {} // name → id

  for (const cat of existingCategories) {
    categoryMap[cat.title] = cat.id as string
  }

  // 3. Create missing categories
  for (const name of neededCategories) {
    if (!categoryMap[name]) {
      const created = await payload.create({
        collection: 'categories',
        data: { title: name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      })
      categoryMap[name] = created.id as string
      console.log(`Created category: ${name}`)
    } else {
      console.log(`Category exists: ${name}`)
    }
  }

  // 4. Fetch all products
  const { docs: products } = await payload.find({
    collection: 'products',
    limit: 100,
    depth: 0,
  })

  console.log('\nAssigning categories...')

  // 5. Update each product
  for (const product of products) {
    const categoryName = productCategories[product.slug]
    if (!categoryName) {
      console.log(`  — Skipping "${product.title}" (no category mapping)`)
      continue
    }

    const categoryId = categoryMap[categoryName]
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { categories: [categoryId] },
    })

    console.log(`  ✓ "${product.title}" → ${categoryName}`)
    await new Promise((r) => setTimeout(r, 300))
  }

  console.log('\nDone!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
