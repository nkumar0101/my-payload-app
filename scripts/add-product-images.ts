import { getPayload } from 'payload'
import config from '../src/payload.config.js'

// Each product maps to an image URL.
// Unsplash timestamp-format IDs: https://images.unsplash.com/photo-{id}?...
// loremflickr keyword URLs as fallback: https://loremflickr.com/800/600/{keywords}
const productImages: Record<string, { url: string; description: string }> = {
  'classic-white-sneakers': {
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    description: 'sneakers',
  },
  'leather-wallet': {
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    description: 'watch',
  },
  'canvas-tote-bag': {
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    description: 'headphones',
  },
  'wool-beanie': {
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
    description: 't-shirt',
  },
  'ceramic-coffee-mug': {
    url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
    description: 'camera',
  },
  'cotton-crew-neck-sweatshirt': {
    url: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400',
    description: 'polo shirt',
  },
  'stainless-steel-water-bottle': {
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    description: 'phone',
  },
  'linen-shirt': {
    url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400',
    description: 'jacket',
  },
  'leather-card-holder': {
    url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    description: 'laptop',
  },
  'scented-soy-candle': {
    url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400',
    description: 'running shoes',
  },
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status}): ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  const payload = await getPayload({ config })

  const { docs: products } = await payload.find({
    collection: 'products',
    limit: 100,
    depth: 2,
  })

  const toUpdate = products.filter((p) => productImages[p.slug])

  if (toUpdate.length === 0) {
    console.log('No matching products found.')
    process.exit(0)
  }

  console.log(`Updating images for ${toUpdate.length} product(s)...\n`)

  for (const product of toUpdate) {
    const { url, description } = productImages[product.slug]!
    try {
      console.log(`Downloading image for "${product.title}"...`)
      const imageData = await downloadImage(url)

      // Delete old gallery media if present
      const existingGallery = product.gallery ?? []
      for (const entry of existingGallery) {
        const mediaId = typeof entry.image === 'object' ? entry.image?.id : entry.image
        if (mediaId) {
          await payload.delete({ collection: 'media', id: mediaId }).catch(() => {})
        }
      }

      const media = await payload.create({
        collection: 'media',
        data: { alt: description },
        file: {
          data: imageData,
          mimetype: 'image/jpeg',
          name: `${product.slug}.jpg`,
          size: imageData.length,
        },
      })

      await payload.update({
        collection: 'products',
        id: product.id,
        data: { gallery: [{ image: media.id }] },
      })

      console.log(`  ✓ "${product.title}"`)
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`  ✗ "${product.title}":`, err instanceof Error ? err.message : err)
    }
  }

  console.log('\nDone!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
