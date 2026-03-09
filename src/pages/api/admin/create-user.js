let users = [];

export async function POST({ request }) {

const body = await request.json();

const newUser = {
username: body.username,
password: body.password,
industry: body.industry
};

users.push(newUser);

return new Response(
JSON.stringify({
message: "User created successfully",
user: newUser
}),
{
headers: { "Content-Type": "application/json" }
}
);

}