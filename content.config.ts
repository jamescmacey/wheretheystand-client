import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    reference: defineCollection({
      type: 'page',
      source: 'reference/*.md'
    }),
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date()
      })
    }),
    docs: defineCollection({
      type: 'page',
      source: {
        repository: 'https://github.com/jamescmacey/wheretheystand-django',
        include: 'docs/*.md'
      },
      schema: z.object({
        title: z.string(),
        description: z.string()
      })
    }),
    changes: defineCollection({
      type: 'page',
      source: 'changes/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.date()
      })
    })
  }
})