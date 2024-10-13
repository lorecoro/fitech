const portConfig = { port: 7777 };

const items = [
    { name: "zero" },
    { name: "one" },
    { name: "two" },
    { name: "three" },
];

const handleGetRoot = async (req) => {
    return new Response("This is root");
}

const handleGetItem = async (req, urlPattnerResult) => {
    const id = urlPattnerResult.pathname.groups.id;
    return Response.json(items[id]);
}

const handleGetItems = async (req) => {
    return new Response("This returns all items");
}

const handlePostItem = async (req) => {
    const item = await req.json();
    items.push(item);
    return new Response("OK", { status: 200 });
};

const urlMapping = [
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/items/:id" }),
        fn: handleGetItem
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/items" }),
        fn: handleGetItems
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/items" }),
        fn: handlePostItem
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/" }),
        fn: handleGetRoot
    },
];

const handleRequest = async (req) => {
    const mapping = urlMapping.find(
        (url) => url.method === req.method && url.pattern.test(req.url)
    );

    if (!mapping) {
        return new Response("Not found", { status: 404 });
    }

    const mappingResult = mapping.pattern.exec(req.url);
    return await mapping.fn(req, mappingResult);
}

// this is the simplest way, but only compatible with HTTP/1.1 (not HTTP/2)
//Deno.serve(portConfig, handleRequest);

// longer implementation, compatible with HTTP/2
const handleHttpConnection = async (conn) => {
    for await (const requestEvent of Deno.serveHttp(conn)) {
        requestEvent.respondWith(await handleRequest(requestEvent.request));
    }
}

for await (const conn of Deno.listen(portConfig)) {
    handleHttpConnection(conn);
}