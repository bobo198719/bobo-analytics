let users = [];

export async function POST({ request }) {

const { username, password } = await request.json();

const user = users.find(
u => u.username === username && u.password === password
);

if (!user) {

return new Response(
JSON.stringify({ error: "Invalid credentials" }),
{
status: 401,
headers: { "Content-Type": "application/json" }
}
);

}

return new Response(
JSON.stringify({
message: "Login successful",
industry: user.industry
}),
{
headers: { "Content-Type": "application/json" }
}
);

}