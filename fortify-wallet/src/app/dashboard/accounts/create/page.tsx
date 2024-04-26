export default function CreateUserPage() {
  return (
    <div>
      <h2 className="mb-[1rem] text-3xl font-bold">Create Account</h2>
      <form>
        <label>Username</label>
        <input type="text" name="username" />
        <label>Password</label>
        <input type="password" name="password" />
        <button type="submit">Create account</button>
      </form>
    </div>
  );
}
