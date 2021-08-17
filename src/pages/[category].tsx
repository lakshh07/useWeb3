import React from 'react'
import { GetStaticProps, GetStaticPaths } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { Main as MainLayout } from 'components/layouts/main'
import { ContentItem } from 'types/content-item'
import { Featured } from 'components/featured'
import { Card } from 'components/card'
import { AirtableItemService } from 'services/airtable'
import { Category } from 'types/category'
import { NavigationProvider } from 'context/navigation'
import { SEO } from 'components/SEO'

interface Props {
  categories: Array<Category>
  category: Category
  items: Array<ContentItem>
}

interface Params extends ParsedUrlQuery {
  category: string
}

export default function Index(props: Props) {
  return (
    <NavigationProvider categories={props.categories}>
      <SEO title={props.category.title} description={props.category.description} />

      <MainLayout title={props.category.title}>
        {props.category.description && 
          <article>
            <p dangerouslySetInnerHTML={{__html: props.category.description }} />
          </article>
        }

        <main>
          <Featured>
            {props.items.map(i => {
              return (
                <Card
                  key={i.title}
                  title={i.title}
                  description={i.description}
                  url={i.url} />
              )
            })}
          </Featured>
        </main>
      </MainLayout>
    </NavigationProvider>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const service = new AirtableItemService()
  const categories = await service.GetCategories()

  return {
    paths: categories.map(i => {
      return {
        params: { category: i.id }
      }
    }),
    fallback: false
  }
}

export const getStaticProps: GetStaticProps<Props, Params> = async (context) => {
  const categoryId = context.params?.category
  if (!categoryId) {
    return {
      props: null,
      notFound: true,
    }
  }
  
  const service = new AirtableItemService()
  const category = await service.GetCategory(categoryId)
  if (!category) {
    return {
      props: null,
      notFound: true,
    }
  }

  const categories = await service.GetCategories()
  const items = await service.GetItems(categoryId, false)
  return {
    props: {
      categories,
      category,
      items
    },
  }
}
