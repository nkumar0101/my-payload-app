import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const products = [
  {
    title: 'Classic White Sneakers',
    slug: 'classic-white-sneakers',
    priceInUSD: 8900,
    description: 'Clean, minimal white sneakers perfect for any casual outfit. Lightweight sole with cushioned insole for all-day comfort.',
  },
  {
    title: 'Leather Wallet',
    slug: 'leather-wallet',
    priceInUSD: 4500,
    description: 'Slim genuine leather bifold wallet with RFID blocking. Fits up to 8 cards and has a center bill compartment.',
  },
  {
    title: 'Canvas Tote Bag',
    slug: 'canvas-tote-bag',
    priceInUSD: 2800,
    description: 'Heavy-duty canvas tote bag with reinforced handles. Spacious interior fits a 15" laptop plus daily essentials.',
  },
  {
    title: 'Wool Beanie',
    slug: 'wool-beanie',
    priceInUSD: 1800,
    description: 'Soft merino wool beanie for cold days. One size fits most with a comfortable ribbed stretch.',
  },
  {
    title: 'Ceramic Coffee Mug',
    slug: 'ceramic-coffee-mug',
    priceInUSD: 2200,
    description: '12oz hand-thrown ceramic mug. Microwave and dishwasher safe. Each piece has a unique, slightly varied glaze.',
  },
  {
    title: 'Cotton Crew Neck Sweatshirt',
    slug: 'cotton-crew-neck-sweatshirt',
    priceInUSD: 6500,
    description: '100% heavyweight cotton fleece sweatshirt with a relaxed fit. Pre-shrunk and garment-washed for a broken-in feel from day one.',
  },
  {
    title: 'Stainless Steel Water Bottle',
    slug: 'stainless-steel-water-bottle',
    priceInUSD: 3500,
    description: 'Double-walled 32oz stainless steel bottle. Keeps drinks cold 24 hours or hot 12 hours. Leak-proof lid included.',
  },
  {
    title: 'Linen Shirt',
    slug: 'linen-shirt',
    priceInUSD: 7200,
    description: 'Breathable stonewashed linen button-up shirt. Relaxed fit with a slightly oversized silhouette, ideal for warm weather.',
  },
  {
    title: 'Leather Card Holder',
    slug: 'leather-card-holder',
    priceInUSD: 2500,
    description: 'Minimalist full-grain leather card holder that holds up to 5 cards. Gets better with age as the leather develops a natural patina.',
  },
  {
    title: 'Scented Soy Candle',
    slug: 'scented-soy-candle',
    priceInUSD: 3200,
    description: '8oz hand-poured soy wax candle with a cotton wick. Available in cedarwood, vanilla, and eucalyptus. Burns for up to 50 hours.',
  },
]

function makeDescription(text: string) {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              type: 'text',
              version: 1,
            },
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

async function main() {
  const payload = await getPayload({ config })

  for (const product of products) {
    // Skip if already exists
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.log(`Skipping "${product.title}" — already exists`)
      continue
    }

    await payload.create({
      collection: 'products',
      data: {
        title: product.title,
        slug: product.slug,
        _status: 'published',
        priceInUSDEnabled: true,
        priceInUSD: product.priceInUSD,
        description: makeDescription(product.description) as any,
        gallery: [],
        layout: [],
      },
    })

    console.log(`Created: ${product.title} ($${(product.priceInUSD / 100).toFixed(2)})`)
  }

  console.log('\nDone!')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
