import { getListen, getUse } from "rebloom"

class HelloExample {
    static use = getUse<typeof HelloExample>();

    static listen = getListen<typeof HelloExample>();

    static count = 0;
}

const GetUseExample = () => {
    const count = HelloExample.use('count');

    return (
        <button onClick={() => HelloExample.count += 1}>
            Click me {count}
        </button>
    )
}

export default GetUseExample