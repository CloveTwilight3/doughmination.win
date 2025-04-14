export default function Dashboard({ onLogout }) {
    async function setFront(memberIds) {
      const res = await fetch("/api/switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ members: memberIds }),
      });
  
      const data = await res.json();
      console.log("Switch result:", data);
    }
  
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Welcome</h2>
        <button
          onClick={() => setFront(["member_id_here"])}
          className="bg-green-600 text-white p-2 rounded"
        >
          Set Front
        </button>
        <button onClick={onLogout} className="ml-4 text-red-600 underline">
          Log Out
        </button>
      </div>
    );
  }
  