import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const newProducts = [
  {
    title: 'AirPods',
    slug: 'airpods',
    priceInUSD: 12900,
    description: 'Wireless earbuds with seamless device switching, adaptive audio, and all-day battery life. Includes a charging case.',
    imageUrl: 'https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=400',
  },
  {
    title: 'Laptop',
    slug: 'laptop',
    priceInUSD: 129900,
    description: 'Thin and powerful laptop with a stunning display, fast processor, and all-day battery. Perfect for work and creativity.',
    imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
  },
  {
    title: 'Smart Watch',
    slug: 'smart-watch',
    priceInUSD: 39900,
    description: 'Feature-packed smartwatch with health tracking, GPS, notification support, and a sleek always-on display.',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',
  },
  {
    title: 'Tablet',
    slug: 'tablet',
    priceInUSD: 59900,
    description: 'Versatile tablet with a crisp display, powerful chip, and optional keyboard support. Great for media, sketching, and productivity.',
    imageUrl: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400',
  },
  {
    title: 'Bluetooth Speaker',
    slug: 'bluetooth-speaker',
    priceInUSD: 8900,
    description: 'Portable 360° speaker with rich bass, waterproof build, and 12-hour playtime. Connects to any Bluetooth device in seconds.',
    imageUrl: 'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=400',
  },
  {
    title: 'Hoodie',
    slug: 'hoodie',
    priceInUSD: 7500,
    description: 'Premium heavyweight cotton hoodie with a relaxed fit, kangaroo pocket, and soft fleece interior. Built to last.',
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400',
  },
  {
    title: 'Denim Jacket',
    slug: 'denim-jacket',
    priceInUSD: 9500,
    description: 'Classic washed denim jacket with a slightly oversized fit. A wardrobe staple that pairs with anything.',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
  },
  {
    title: 'Graphic T-Shirt',
    slug: 'graphic-t-shirt',
    priceInUSD: 3500,
    description: '100% organic cotton graphic tee with a boxy fit. Screen-printed design that stays vibrant wash after wash.',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
  },
  {
    title: 'Sneakers',
    slug: 'sneakers',
    priceInUSD: 11000,
    description: 'Everyday low-top sneakers with a cushioned sole and breathable upper. Clean design that works with any outfit.',
    imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400',
  },
  {
    title: 'Sweatshirt',
    slug: 'sweatshirt',
    priceInUSD: 6000,
    description: 'Garment-dyed pullover sweatshirt in a vintage relaxed fit. Made from French terry cotton for a soft, broken-in feel.',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400',
  },
]

function makeDescription(text: string) {
  return {
    root: {
      children: [
        {
          children: [
            { detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
          textFormat: 0,
          textStyle: '',
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status}): ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  const payload = await getPayload({ config })

  for (const p of newProducts) {
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: p.slug } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping "${p.title}" — already exists`)
      continue
    }

    try {
      console.log(`Creating "${p.title}"...`)
      const imageData = await downloadImage(p.imageUrl)

      const media = await payload.create({
        collection: 'media',
        data: { alt: p.title },
        file: {
          data: imageData,
          mimetype: 'image/jpeg',
          name: `${p.slug}.jpg`,
          size: imageData.length,
        },
      })

      await payload.create({
        collection: 'products',
        data: {
          title: p.title,
          slug: p.slug,
          _status: 'published',
          priceInUSDEnabled: true,
          priceInUSD: p.priceInUSD,
          description: makeDescription(p.description) as any,
          gallery: [{ image: media.id }],
          layout: [],
        },
      })

      console.log(`  ✓ Created ($${(p.priceInUSD / 100).toFixed(2)})`)
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`  ✗ Failed:`, err instanceof Error ? err.message : err)
    }
  }

  console.log('\nDone!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
