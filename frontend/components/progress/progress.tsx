interface RootProps {
    total: number
    current: number
}
const Root = (props: RootProps) => {
    const { current, total } = props
    return (
        <div data-scope="progress" data-part="root">
            {Array.from({ length: total }).map((_, index) => (
                <span
                    key={index}
                    data-scope="progress"
                    data-part="segment"
                    data-active={current === index + 1 ? "" : null}
                    data-completed={current > index + 1 ? "" : null}
                />
            ))}
        </div>
    )
}

export const Progress = {
    Root: Root,
}
