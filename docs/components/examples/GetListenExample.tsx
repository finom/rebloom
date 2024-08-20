import { init } from "next/dist/compiled/webpack/webpack";
import { getListen, getUse } from "rebloom"

abstract class HelloExample {
    static use = getUse<typeof HelloExample>();

    static listen = getListen<typeof HelloExample>();

    static count = 0;

    static init() {
        this.listen('count', (count) => {
            alert(count);
        });
    }
}

HelloExample.init();

const GetListenExample = () => {
    const count = HelloExample.use('count');

    return (
        <button onClick={() => HelloExample.count += 1}>
            Click me {count}
        </button>
    )
}

export default GetListenExample