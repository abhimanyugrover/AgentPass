import { Product } from '@/app/lib/products';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="glass-card p-5 hover:border-indigo-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10 group">
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{product.emoji}</div>
      <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">{product.category}</span>
      <h3 className="font-semibold text-white mt-1 mb-1">{product.name}</h3>
      <p className="text-xs text-gray-400 mb-3 leading-relaxed">{product.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold gradient-text">${product.price}</span>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
          product.price <= 500 ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'
        }`}>
          {product.price <= 500 ? '✓ Within $500 cap' : '✗ Over $500 cap'}
        </span>
      </div>
    </div>
  );
}
