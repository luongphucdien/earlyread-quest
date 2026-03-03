import { HTMLAttributes } from "react"

interface RootProps extends HTMLAttributes<HTMLDivElement> {}
const Root = (props: RootProps) => {
    return <div data-scope="card" data-part="root" {...props} />
}

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {}
const Title = (props: TitleProps) => {
    return <h1 data-scope="card" data-part="title" {...props} />
}

interface SubtitleProps extends HTMLAttributes<HTMLParagraphElement> {}
const Subtitle = (props: SubtitleProps) => {
    return <p data-scope="card" data-part="subtitle" {...props} />
}

interface BodyProps extends HTMLAttributes<HTMLDivElement> {}
const Body = (props: BodyProps) => {
    return <div data-scope="card" data-part="body" {...props} />
}

export const Card = {
    Root: Root,
    Title: Title,
    Subtitle: Subtitle,
    Body: Body,
}
