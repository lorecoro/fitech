import postgres from "postgres";

const sql = postgres('postgres://lorenzo:password@localhost:5432/postgres', {});

const handleGetTodos = async (req) => {
    const todos = await sql`SELECT id, item from todos`;
    return Response.json(todos);
}

const handleGetTodo = async (req, urlPatternResult) => {
    const id = urlPatternResult.pathname.groups.id;
    const todo = await sql`SELECT id, item from todos where id = ${id}`;
    if (!todo || todo.length == 0) {
        return new Response("Not found", { status: 404 });
    }
    return Response.json(todo);
}

// ex: curl -X POST -d '{"item": "practice"}' "localhost:7777/todos"
const handlePostTodo = async (req) => {
    try {
        const todo = await req.json();
        if (!todo || todo.length == 0 || !todo.item) {
            return new Response("Error", { status: 400 });
        }
        await sql`INSERT INTO todos (item) VALUES (${todo.item})`;
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
        method: "GET",
        pattern: new URLPattern({ pathname: "/todos/:id" }),
        fn: handleGetTodo
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
        const urls = urlMapping.map(url => {
            return `${url.method} ${url.pattern.pathname}`
        });
        return new Response(
            `Not found; available endpoints are: ${urls}`,
            { status: 404 }
        );
    }

    const mappingResult = mapping.pattern.exec(req.url);
    return await mapping.fn(req, mappingResult);
}

Deno.serve({ port: 7777 }, handleRequest);