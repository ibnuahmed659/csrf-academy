import { CartoonLibrary } from '@/components/cartoon/CartoonLibrary'
import { cartoonSeries, cartoons } from '@/content/cartoon'

export default function Cartoons() {
  return (
    <div className="container-page py-10">
      <CartoonLibrary
        kicker={`${cartoonSeries.length} series · ${cartoons.length} episodes`}
        heading="CSRF cartoons"
        description="The complete animated CSRF track: what the attack really is, the classic types, the defenses (tokens, SameSite, Origin checks), how those defenses get bypassed, CSRF in modern apps, real-world case studies, and a full capstone engagement. Faceless characters, plain language, and a quiz per episode."
        series={cartoonSeries}
      />
    </div>
  )
}
