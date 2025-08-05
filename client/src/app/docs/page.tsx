import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Documentation() {
  const sections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of integrating PactDa into your application',
      links: [
        { title: 'Quick Start Guide', href: '/docs/quickstart' },
        { title: 'Installation', href: '/docs/installation' },
        { title: 'Authentication', href: '/docs/auth' },
      ]
    },
    {
      title: 'SDK Reference',
      description: 'Complete reference for the PactDa TypeScript SDK',
      links: [
        { title: 'SDK Overview', href: '/docs/sdk' },
        { title: 'Client Configuration', href: '/docs/sdk/config' },
        { title: 'Agreement Management', href: '/docs/sdk/agreements' },
        { title: 'Event Handling', href: '/docs/sdk/events' },
      ]
    },
    {
      title: 'API Reference',
      description: 'REST API endpoints and WebSocket events',
      links: [
        { title: 'REST API', href: '/docs/api' },
        { title: 'WebSocket Events', href: '/docs/websockets' },
        { title: 'Error Codes', href: '/docs/errors' },
      ]
    },
    {
      title: 'Guides & Tutorials',
      description: 'Step-by-step guides for common use cases',
      links: [
        { title: 'Building a Wager Game', href: '/docs/guides/wager-game' },
        { title: 'Trusted Authority Setup', href: '/docs/guides/authorities' },
        { title: 'Testing Integration', href: '/docs/guides/testing' },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to integrate PactDa into your application
          </p>
        </div>

        {/* Quick Start Banner */}
        <Card className="mb-12 bg-primary/5 border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
                <p className="text-muted-foreground">
                  Follow our quick start guide to integrate PactDa in under 10 minutes.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/docs/quickstart">Quick Start Guide</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Code Example */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Quick Example</CardTitle>
            <CardDescription>
              Create an agreement with just a few lines of code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{`import { PactDa } from '@pactda/sdk';

const pactda = new PactDa({
  apiKey: 'your-api-key',
  environment: 'production'
});

const agreement = await pactda.agreements.create({
  title: 'Rock Paper Scissors Game',
  participants: ['player1@example.com', 'player2@example.com'],
  escrowAmount: 10.00,
  authority: 'game-server@example.com'
});

console.log('Agreement created:', agreement.id);`}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-sm text-primary hover:underline"
                      >
                        {link.title} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://github.com/pactda/sdk" target="_blank">
                GitHub Repository
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}