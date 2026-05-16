const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const apiBase = (process.env.SMOKE_API_BASE || 'http://nutrition-n.test/api').replace(/\/$/, '')
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10000)

const results = []

function withTimeout(promise, label) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(`Timeout: ${label}`), timeoutMs)
  return Promise.resolve(promise(controller.signal)).finally(() => clearTimeout(timer))
}

async function checkPage(name, path, mustContain = '<html') {
  return withTimeout(async (signal) => {
    const response = await fetch(`${baseUrl}${path}`, { signal, redirect: 'follow' })
    const html = await response.text()

    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`)
    if (!html.includes(mustContain)) throw new Error(`${name}: expected marker "${mustContain}"`)

    results.push(`[PASS] ${name} ${path}`)
    return html
  }, name)
}

async function getJson(name, url) {
  return withTimeout(async (signal) => {
    const response = await fetch(url, {
      signal,
      headers: { accept: 'application/json' },
      redirect: 'follow'
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`)
    return data
  }, name)
}

function firstProductSlug(products) {
  const list = Array.isArray(products) ? products : (products?.products || products?.data || [])
  for (const product of list) {
    const slug =
      product?.slug?.uk ||
      product?.slug_translations?.uk ||
      product?.slugs?.uk ||
      (typeof product?.slug === 'string' ? product.slug : '')
    if (slug) return slug
  }
  return ''
}

async function run() {
  await checkPage('home', '/')
  await checkPage('products', '/produkty')

  const products = await getJson('products api', `${apiBase}/products.php?category_id=1&lang=uk`)
  const productSlug = firstProductSlug(products)
  if (!productSlug) throw new Error('product page: no product slug found from products API')
  await checkPage('product', `/produkty/${encodeURIComponent(productSlug)}`)

  await checkPage('blog', '/blog')
  await checkPage('calculation', '/analiz-skladu-tila')
  await checkPage('tariffs', '/rezultat-rozrahunku')

  const orderId = process.env.SMOKE_ORDER_ID
  if (orderId) {
    await withTimeout(async (signal) => {
      const response = await fetch(`${apiBase}/orders/generate_pdf.php`, {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/pdf'
        },
        body: JSON.stringify({
          order_id: Number(orderId),
          locale: 'uk',
          user_name: 'Smoke Test',
          user_email: 'smoke@example.com'
        })
      })
      if (!response.ok) throw new Error(`pdf flow: HTTP ${response.status}`)
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/pdf')) {
        throw new Error(`pdf flow: expected application/pdf, got ${contentType}`)
      }
      results.push(`[PASS] pdf flow order ${orderId}`)
    }, 'pdf flow')
  } else {
    results.push('[SKIP] pdf flow download requires SMOKE_ORDER_ID')
  }
}

run()
  .then(() => {
    console.log(results.join('\n'))
    console.log(`\n${results.filter((line) => line.startsWith('[PASS]')).length} passed, ${results.filter((line) => line.startsWith('[SKIP]')).length} skipped.`)
  })
  .catch((error) => {
    console.error(results.join('\n'))
    console.error(`\n[FAIL] ${error.message}`)
    process.exit(1)
  })
