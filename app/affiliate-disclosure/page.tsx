import Link from "next/link"

export default function AffiliateDisclosurePage() {
    return (
        <div className="space-y-8 pb-8 min-h-screen">
            <div className="container mx-auto px-2 py-8">

                {/* Page Header Section */}
                <section className="text-center space-y-4 mb-12">
                  <h1 className="type-title text-(--color-text-primary) md:text-5xl tracking-tight">
                        Affiliate Disclosure
                    </h1>
                </section>
                  <div className="mx-auto max-w-800px">
                    <Link href="/">
                    <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Back to Tools
                    </button>
                  </Link>

                <p className="type-body text-(--color-text-secondary) md:text-xl pt-3">
                    <i>Sharp Startup LLC</i> participates in affiliate marketing programs, which means <i>Sharp Startup LLC</i> may earn commissions on purchases made through links on this site, at no additional cost to you.  <br /><br />
                    Affiliate links are used to help support the operation of this website. We only recommend products, services, or resources that we believe will provide value to our readers. <br /><br />
                    Any compensation received does not influence the content, topics, or opinions expressed on this site. All views and opinions expressed are purely our own. <br /><br />
                    If you have any questions regarding this affiliate disclosure, feel free to contact us at <i>sharpstartupteam@gmail.com </i>.<br /><br />
                </p>
                  </div>

            </div>

        </div>
    )
}