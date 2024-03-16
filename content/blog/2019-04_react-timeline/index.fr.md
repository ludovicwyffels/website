---
title: "Comment créer une timeline avec React"
authors: [ludovicwyffels]
date: 2019-04-26T8:07:20+02:00
summary: ""
draft: false
categories: ["React"]
tags:
  - "React"
  - "JavaScript"
  - "Node.js"
---

Ces derniers jours, je travaille sur une nouvelle page pour mon site web. Je voulais avoir une timeline pour présenter certaines de mes réalisations au fil des ans.

Je l'ai fait pour deux raisons:

1. Mon futur moi se retournera un jour et dira: "Waouh... Je me souviens du jour où j'ai fait ça! Quel bonheur d'avoir atteint cet objectif!" Notre succès est un voyage,pas une destination, et je souhaite écrire chaque objectif que je réalise en cours de route.
2. Cela pourrait attirer plus de clients (nous verrons comment ça se passe)
3. À mon avis, c'est un type de portfolio différent. Un portfolio unique peut-être? 😜

Néanmoins... Construisons quelque chose maintenant!

Dans l'image ci-dessus, vous pouvez voir ce que nous allons construire aujourd'hui avec React! Avant de commencer, décrivons les étapes à suivre:

1. Créer les `données` dont nous aurons besoin
2. Créer le composant `TimelineItem` - chaque entrée de timeline individuelle
3. Créer un conteneur `Timeline` - il prendra les `données` et les transmettra aux `TimelineItems`.
4. Donnez du style à tout ce que vous faites

## Créer les données

Avant de créer les composants React, nous devons savoir exactement à quoi ressembleront les données pour pouvoir planifier la structure du DOM.

Pour cette application Timeline, nous aurons besoin d'un _tableau d'objets_. Nous appellerons ce tableau: `timelineData`.

Voyons à quoi cela pourrait ressembler: 

```txt
[
    {
        text: 'Wrote my first blog post ever on Medium',
        date: 'March 03 2017',
        category: {
            tag: 'medium',
            color: '#018f69'
        },
        link: {
            url:
                'https://medium.com/@popflorin1705/javascript-coding-challenge-1-6d9c712963d2',
            text: 'Read more'
        }
    },
    {
        // Another object with data
    }
];
````

Ensuite, nous allons construire le composant `TimelineItem`. Ceci utilisera les données de l'objet ci-dessus: 

## Le composant `TimelineItem`

```jsx
const TimelineItem = ({ data }) => (
    <div className="timeline-item">
        <div className="timeline-item-content">
            <span className="tag" style={{ background: data.category.color }}>
                {data.category.tag}
            </span>
            <time>{data.date}</time>
            <p>{data.text}</p>
            {data.link && (
                <a
                    href={data.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {data.link.text}
                </a>
            )}
            <span className="circle" />
        </div>
    </div>
);
```

Nous avons les tags suivants:

1. Div `.timeline-item` - utilisé comme wrapper. Cette div aura la moitié de la largeur de la largeur de son parent (`50%`) et toutes les autres div `.timeline-item` seront placées du côté droit en utilisant le sélecteur `:nth-child(odd)`
2. Div `.timeline-item-content` - un autre wrapper (plus d'informations sur la raison pour laquelle nous en avons besoin dans la section relative au style)
3. Span `.tag` - cette balise aura une couleur d'arrière-plan personnalisée en fonction de la catégorie
4. `link` - nous devrons vérifier si un lien est fourni parce que nous ne voulons pas toujours en avoir un
5. Span `.circle` - cette balise sera utilisée pour placer un cercle sur la ligne du milieu

**Note**: Tout aura beaucoup plus de sens quand nous arriverons à la partie **CSS**, mais avant cela, créons le composant `Timeline`:

## Le conteneur `Timeline`

Ce composant mappera fondamentalement sur le tableau et pour chaque objet il créera un composant `TimelineItem`. Nous ajoutons également une petite vérification pour nous assurer qu'il y a au moins un élément dans le tableau:

```jsx
import timelineData from '_path_to_file_';
const Timeline = () =>
    timelineData.length > 0 && (
        <div className="timeline-container">
            {timelineData.map((data, idx) => (
                <TimelineItem data={data} key={idx} />
            ))}
        </div>
    );
```

Comme mentionné ci-dessus, `timelineData` est le tableau d'objets contenant toutes les informations requises. Dans mon cas, j'ai stocké ce tableau dans un fichier et je l'ai importé, mais vous pouvez le prendre à partir de votre propre base de données ou d'une API, à vous de choisir.

## Le CSS

**Remarque**: la plupart des wrappers seront des conteneneurs `flexbox`, car nous pouvons jouer plus facilement avec leur positionnement.

Commençons par le CSS `.timeline-container`:

```css
.timeline-container {
    display: flex;
    flex-direction: column;
    position: relative;
    margin: 40px 0;
}
.timeline-container::after {
    background-color: #e17b77;
    content: '';
    position: absolute;
    left: calc(50% - 2px);
    width: 4px;
    height: 100%;
}
```

Nous utilisons le sélecteur `::after` pour créer cette ligne rouge au milieur du `.timeline-container`. En utilisant la fonction `calc()`, nous pouvons positionner la ligne exactement au milieur en soustrayant la moitié de sa taille (`2px`) à `50%`. Nous devons le faire, car par défaut, la propriété `left` positionne en fonction du bord gauche d'un élément et non du milieu.

Passons maintenant au wrapper `.timeline-item`.

Ci-dessous, vous pouvez voir un exemple de la façon dont ils sont positionnés dans leur parent (le `.timeline-container`). A des fins de démonstration, j'ai ajouté une bordure pour mettre en évidence ces wrappers.

![timeline wrapper](http://url.com/image.jpg)

Comme vous pouvez le constater, tous les autres wrappers vont **à droite** et le wrapper interne (le `.timeline-item-content`) prend moins d’espace - l’espace est donné par la balise `p` qui est à l’intérieur (la plupart du temps).

Voyons le CSS pour ceci:

```css
.timeline-item {
    display: flex;
    justify-content: flex-end;
    padding-right: 30px;
    position: relative;
    margin: 10px 0;
    width: 50%;
}
.timeline-item:nth-child(odd) {
    align-self: flex-end;
    justify-content: flex-start;
    padding-left: 30px;
    padding-right: 0;
}
```

La clé de ceci est que nous utilisons le sélecteur `:nth-child(odd)` et que nous définissons la propriété `align-self` sur `flex-end` ce qui signifie: "allez à droite autant que vous le pouvez!"

Étant donné que ces wrappers ont une largeur de `50%`, vous pouvez voir que deux d'entre eux occupent toute la largeur. À partir de maintenant, chaque fois que nous voulons styler différemment quelque chose du bon côté, nous devrons utiliser cette approche.

Ensuite, le `.timeline-item-content`:

```css
.timeline-item-content {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    border-radius: 5px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 15px;
    position: relative;
    width: 400px;
    max-width: 70%;
    text-align: right;
}
.timeline-item-content::after {
    content: ' ';
    background-color: #fff;
    box-shadow: 1px -1px 1px rgba(0, 0, 0, 0.2);
    position: absolute;
    right: -7.5px;
    top: calc(50% - 7.5px);
    transform: rotate(45deg);
    width: 15px;
    height: 15px;
}
.timeline-item:nth-child(odd) .timeline-item-content {
    text-align: left;
    align-items: flex-start;
}
.timeline-item:nth-child(odd) .timeline-item-content::after {
    right: auto;
    left: -7.5px;
    box-shadow: -1px 1px 1px rgba(0, 0, 0, 0.2);
}
```

Nous avons quelques choses à faire:

1. Ce wrapper a une `width` fixe et aussi une `max-width`. C'est parce que nous voulons qu'il y ait des limites, ce qui signifie que s'il n'y a que quelques mots, nous voulons que la box ait au moins `400px` de large, mais s'il y a beaucoup de texte, il ne devrait pas occuper tout l'espace. (`50%` du wrapper `.timeline-item`) mais le texte doit passer à la ligne suivante -> c’est la raison pour laquelle nous avons utilisé ce second wrapper: `.timeline-item-content`
2. Les propriétés `text-align` et `align-items` sont utilisées pour pousser les éléments internes vers la gauche ou vers la droite, en fonction du parent.
3. La petite flèche qui pointe vers la ligne médiane est donnée par les styles appliqués sur le sélecteur `::after`. Fondamentalement, il s'agit d'une box avec une `box-shadow` appliquée sur elle qui est tournée de `45deg`
4. Comme mentionné ci-dessus, nous appelons le côté droit en sélectionnant le parent avec le sélecteur `:nth-child(odd)`

Ensuite, tous les éléments internes:

```css
.timeline-item-content .tag {
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    top: 5px;
    left: 5px;
    letter-spacing: 1px;
    padding: 5px;
    position: absolute;
    text-transform: uppercase;
}
.timeline-item:nth-child(odd) .timeline-item-content .tag {
    left: auto;
    right: 5px;
}
.timeline-item-content time {
    color: #777;
    font-size: 12px;
    font-weight: bold;
}
.timeline-item-content p {
    font-size: 16px;
    line-height: 24px;
    margin: 15px 0;
    max-width: 250px;
}
.timeline-item-content a {
    font-size: 14px;
    font-weight: bold;
}
.timeline-item-content a::after {
    content: ' ►';
    font-size: 12px;
}
.timeline-item-content .circle {
    background-color: #fff;
    border: 3px solid #e17b77;
    border-radius: 50%;
    position: absolute;
    top: calc(50% - 10px);
    right: -40px;
    width: 20px;
    height: 20px;
    z-index: 100;
}
.timeline-item:nth-child(odd) .timeline-item-content .circle {
    right: auto;
    left: -40px;
}
```

Peu de choses à noter ici:

1. Comme vous l'avez peut-être deviné, le `tag` est positionné en `absolute`car nous souhaitons le conserver dans le coin supérieur gauche (ou droit), quelle que soit la taille de la box.
2. Nous voulons ajouter un petit signe après la balise a pour indiquer qu'il s'agit d'un lien.
3. Nous créons un `.circle`. Nous le positionnons au-dessus de la ligne médiane, directement devant la flèche.

Nous avons presque fini! 😄 La seule chose qui reste à faire est d'ajouter le CSS pour que tout soit réactif, quelle que soit la table de l'écran:

```css
@media only screen and (max-width: 1023px) {
    .timeline-item-content {
        max-width: 100%;
    }
}
@media only screen and (max-width: 767px) {
    .timeline-item-content,
    .timeline-item:nth-child(odd) .timeline-item-content {
        padding: 15px 10px;
        text-align: center;
        align-items: center;
    }
    .timeline-item-content .tag {
        width: calc(100% - 10px);
        text-align: center;
    }
    .timeline-item-content time {
        margin-top: 20px;
    }
    .timeline-item-content a {
        text-decoration: underline;
    }
    .timeline-item-content a::after {
        display: none;
    }
}
```

Nous avons deux media query:

1. Sur les petites tailles d’écran d’ordinateur portable - `max-width: 1023px` - nous voulons permettre au `.timeline-item-content` de `.timeline-item-content` sur toute la largeur de son parent, car l’écran est plus petit et sinon, il aurait l’air trop serré.
2. Sur les téléphones - `max-width: 767px`
  - paramétrez le `.tag` sur toute la largeur (et pour cela nous n’avons pas besoin d’oublier de soustraire `10px` du total des `100%` - c’est parce que nous l’avons positionné à `left: 5px`, nous enlevons donc le double de ce montant)
  - centrer tout le texte et le pousser vers le haut juste un peu
  - supprime le curseur sur le lien et ajoute un soulignement - son apparence est meilleure sur mobile

Nous avons terminé!

Voici le résultat:

https://react-timeline-qvnqqp.stackblitz.io

<iframe src="https://stackblitz.com/edit/react-timeline-qvnqqp?embed=1&hideExplorer=0&hideNavigation=1" width="100%" height="600px"></iframe>

## Conclusion

S'il y a quelque chose que vous n'avez pas compris dans cet article, assurez-vous de me contacter et je me ferai un plaisir de répondre à vos questions!

Bon codage! 😇
