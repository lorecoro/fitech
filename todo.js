const todos = [];

const handleGetTodos = async (req) => {
    return Response.json(todos);
}

const handlePostTodo = async (req) => {
    try {
        const todo = await req.json();
        todos.push(todo);
        return new Response("OK", { status: 200 });
    }
    catch (err) {
        return new Response("Error", { status: 400 });
    }
};

const urlMapping = [
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/todos" }),
        fn: handleGetTodos
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/todos" }),
        fn: handlePostTodo
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

Deno.serve({ port: 7777 }, handleRequest);