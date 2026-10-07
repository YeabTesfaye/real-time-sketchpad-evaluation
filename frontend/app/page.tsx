
export const metadata = {
  title: "Sketchpad - Draw it out together",
  description: "Draw it out together. Collaborative sketching for designers, engineers and students.",
};

export default function Page() {
  return (
    <>
      <main className="min-h-[calc(100dvh-4rem)] flex w-full flex-col items-center justify-center bg-background">
        <div className="flex w-full max-w-xl items-center space-y-6">
          {/* Faint dotted-grid background built in CSS from the border token */}
          <div className="absolute inset-0 -z-10 pointer-events-none opacity-10">
            <div className="w-full h-[calc(100dvh-4rem)] bg-[url('data:image/svg+xml;utf8,<svg xmlns%3D%22http://www.w3.org/2000/svg%22 width%3D%2220%22 height%3D%2220%22%3E%3Crect width%3D%2220%22 height%3D%2220%22 fill%3D%22none%22/%3E%3Cpath d%3D%22M0 10L20 10M10 0L10 20%22 stroke%3D%22%23DDD7C8%22 stroke-width%3D%221%22/%3E%3C/svg%3E')]">
            </div>
          </div>

          <div className="flex flex-col w-full items-start space-y-4">
            <h1 className="text-4xl font-display font-semibold text-foreground leading-tight">
              Draw it out together.
            </h1>
            <p className="text-base text-muted max-w-md">
              Start a collaboration session in seconds.
            </p>

            <div className="flex w-full items-start space-x-3">
              {/* Primary button "Start a new room" */}
              <button
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-medium text-sm rounded-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-50"
              >
                Start a new room
              </button>

              <div className="flex flex-col space-y-1">
                <p className="text-xs text-muted">
                  or join with a code
                </p>

                <div className="flex w-full space-x-2">
                  {/* Mono Input */}
                  <input
                    type="text"
                    placeholder="Enter room code"
                    className="flex-1 h-10 w-0 flex-1 bg-input border border-input textForeground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 font-mono text-sm px-3"
                  />

                  {/* Join button */}
                  <button
                    className="h-10 w-10 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}