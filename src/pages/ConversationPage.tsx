import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../auth";
import { BrandedLoader, Spinner } from "../components/BrandedLoader";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; email: string; displayName: string | null };
};

export function ConversationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [threadBooting, setThreadBooting] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!id) return;
    const res = await apiFetch<{ messages: Message[] }>(
      `/api/conversations/${id}/messages`
    );
    setMessages(res.messages);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setThreadBooting(true);
    fetchMessages()
      .catch(() => null)
      .finally(() => setThreadBooting(false));
    const iv = window.setInterval(() => {
      fetchMessages().catch(() => null);
    }, 5000);
    return () => window.clearInterval(iv);
  }, [id, fetchMessages]);

  async function send(ev: FormEvent) {
    ev.preventDefault();
    if (!id) return;
    setError(null);
    setSending(true);
    try {
      await apiFetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      await fetchMessages();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (!user) return <div className="panel">Sign in.</div>;

  if (threadBooting) {
    return (
      <section className="panel">
        <Link className="inline-link small" to="/conversations" style={{ display: "inline-block", marginBottom: "0.6rem" }}>
          ← All threads
        </Link>
        <BrandedLoader label="Loading messages" size="default" />
      </section>
    );
  }

  return (
    <section className="panel">
      <Link className="inline-link small" to="/conversations" style={{ display: "inline-block", marginBottom: "0.6rem" }}>
        ← All threads
      </Link>
      <h2 className="h2-heading">Conversation</h2>

      <div className="messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`bubble ${m.sender.id === user.id ? "bubble-me" : "bubble-them"}`}
          >
            <div className="bubble-meta">
              <strong>{m.sender.displayName ?? m.sender.email.split("@")[0]}</strong>
              <span>{new Date(m.createdAt).toLocaleString()}</span>
            </div>
            <p style={{ margin: 0 }}>{m.body}</p>
          </div>
        ))}
        {!messages.length && (
          <div
            className="muted"
            style={{
              textAlign: "center",
              padding: "1.5rem",
              border: "1px dashed var(--hairline)",
              borderRadius: "var(--radius-md)",
            }}
          >
            Say hello and coordinate the swap.
          </div>
        )}
      </div>

      <form className="message-form" onSubmit={send}>
        <textarea
          rows={3}
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="actions-inline">
          {error ? <span className="banner error">{error}</span> : null}
          <button type="submit" className="btn primary" disabled={!body.trim() || sending}>
            <span className="btn-inner">
              {sending ? <Spinner /> : null}
              {sending ? "Sending…" : "Send"}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}
