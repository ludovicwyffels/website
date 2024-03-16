---
title: "Bienvenue sur mon blog crée avec Gatsby"
authors: [ludovicwyffels]
date: 2019-04-17T11:30:26+02:00
summary: "Pourquoi Gatsby.js ?"
draft: false
categories: ["Node.js"]
tags:
  - "Gatsby"
  - "Node.js"
  - "TypeScript"
  - "Javascript"
---

Gatsby est un générateur de site statique pour React.js qui permet à l'utilisateur de créer des sites Web rapides et dynamiques. Gatsby se concentre sur l'optimisation des appareils mobiles et crée automatiquement une PWA (Progressive Web App). Le site Web est alimenté par diverses sources: Markdown, CMS, API, bases de données et bien d’autres.

## Pourquoi Gatsby.js?

J'ai longtemps repoussé la relance de mon site, également parce que je n'avais pas trouvé de solution adéquate pour un blog. Souvent, la configuration était trop compliquée, les possibilités trop petites; mais je ne voulais pas non plus écrire du code HTML pur pour mes articles de blog. Avec la popularité croissante de React.js, je ne pouvais pas échapper à cet hype médiatique et me lire moi-même. Comme je pensais déjà en termes de composants dans la phase de conception, React.js était la prochaine étape logique.

Au début de 2019, j'ai découvert Gatsby.js et j'étais enthousiasmé par la possibilité d'écrire mon site Web avec React ainsi que les messages de mon blog avec Markdown ou un CMS "headless" (par exemple, Contentful ou Prismic). Cela vous demande beaucoup de travail et vous permet de démarrer facilement.

## Magie (GraphQL)

Pour obtenir les données des fichiers Markdown, des CMS, etc. dans React et enfin à l'écran, Gatsby utilise le langage de requête GraphQL. La communauté déjà mentionnée fournit certains plugins (par exemple, Contentful, Drupal, Lever, Medium, Wordpress, MongoDB, Markdown, Prismic) pour obtenir les données. L'utilisation ultérieure de GraphQL est un jeu d'enfant:

```graphql
export const pageQuery = graphql`
  query ProjectsQuery {
    allMarkdownRemark(
      limit: 1000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fields: { sourceInstanceName: { eq: "projects" } } }
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
            customer
            cover {
              childImageSharp {
                fluid(maxWidth: 1200, quality: 95) {
                  base64
                  aspectRatio
                  src
                  srcSet
                  sizes
                  originalImg
                  originalName
                }
              }
            }
          }
        }
      }
    }
  }
`
```

Avec cette requête, vous obtenez tous les projets (y compris les données de Frontmatter) pour les sous-pages de projet, triés par date (en supposant une configuration adéquate). Afin de générer les images appropriées pour chaque taille d'écran, un autre plug-in, qui utilise la bibliothèque Sharp, prend les images définies dans le fichier Markdown et en crée des images dans plusieurs tailles. Si vous rencontrez des problèmes avec la requête, vous pouvez utiliser le débogueur graphique interactif GraphiQL pour afficher des suggestions et tester la requête vous-même - le débogueur crée automatiquement sa propre documentation.

Ces données peuvent ensuite être utilisées dans les composants React comme ceci:

```jsx
<h1>{this.props.data.allMarkdownRemark.edges.node.frontmatter.title}</h1>
```

## Quoi d'autre... ?

La création de mon site Web a été extrêmement rapide avec React. J'ai également beaucoup appris sur les PWA et continuerai à essayer d'améliorer le score de Lighthouse Score de Google. Le site Web est open source et peut être consulté sur GitHub à des fins d’apprentissage.
