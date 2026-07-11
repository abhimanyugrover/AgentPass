import { products } from '@/app/lib/products';
import ProductCard from '@/app/components/ProductCard';
import ActivityLog from '@/app/components/ActivityLog';

export default function StorePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          AgentPass <span className="gradient-text">Store Demo</span>
        </h1>
        <p className="text-gray-400 max-w-2xl">
          A mock e-commerce storefront where AI agents shop using signed credentials.
          Watch the activity log as agents attempt purchases — some succeed, some get blocked.
        </p>
      </div>

      {/* Main Layout: Products + Activity */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Product Grid */}
        <div className="lg:w-[60%]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Product Catalog</h2>
            <span className="text-xs text-gray-500">{products.length} items</span>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* How it works explainer */}
          <div className="mt-8 glass-card p-6">
            <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">How the 3-Act Demo Works</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 font-bold shrink-0 mt-0.5">Act 1</span>
                <p className="text-sm text-gray-400">
                  <span className="text-white font-medium">Happy Path</span> — Agent has valid JWT with <code className="text-cyan-400 text-[10px]">purchase:max_500</code> scope and trust score of 82.
                  Purchases Wireless Earbuds ($79.99). <span className="text-green-400">Approved ✅</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/20 font-bold shrink-0 mt-0.5">Act 2</span>
                <p className="text-sm text-gray-400">
                  <span className="text-white font-medium">Scope Exceeded</span> — Same agent tries Gaming Laptop ($1,299.99), which exceeds the $500 spending cap baked into the token.
                  <span className="text-red-400"> Denied ❌</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/20 font-bold shrink-0 mt-0.5">Act 3</span>
                <p className="text-sm text-gray-400">
                  <span className="text-white font-medium">Trust Collapse</span> — Negative events tank the agent&apos;s trust score to 25. Even a $45.99 USB-C Hub is blocked.
                  <span className="text-red-400"> Denied ❌</span>
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-xs text-gray-400">
                <span className="text-indigo-400 font-semibold">To run the demo:</span> Start the Python demo agent script from the project root.
                Activity will appear in the live feed to the right in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Activity Log (sticky) */}
        <div className="lg:w-[40%]">
          <div className="lg:sticky lg:top-20">
            <ActivityLog />
          </div>
        </div>
      </div>
    </div>
  );
}
