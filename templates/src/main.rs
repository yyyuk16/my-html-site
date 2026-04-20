use warp::Filter;
use warp::ws::{Message, WebSocket};
use futures_util::{StreamExt, SinkExt};
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

type Clients = Arc<Mutex<Vec<mpsc::UnboundedSender<String>>>>;

#[tokio::main]
async fn main() {
    let clients: Clients = Arc::new(Mutex::new(Vec::new()));

    let chat_route = warp::path("ws")
        .and(warp::ws())
        .and(with_clients(clients.clone()))
        .map(|ws: warp::ws::Ws, clients| {
            ws.on_upgrade(move |socket| handle_connection(socket, clients))
        });

    println!("WebSocketサーバーを起動中: ws://0.0.0.0:3000/ws");

    warp::serve(chat_route)
        .run(([0, 0, 0, 0], 3000)) // ポート3000で待機
        .await;
}

fn with_clients(clients: Clients) -> impl Filter<Extract = (Clients,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || clients.clone())
}

async fn handle_connection(ws: WebSocket, clients: Clients) {
    let (mut tx_socket, mut rx_socket) = ws.split();

    let (tx, mut rx) = mpsc::unbounded_channel::<String>();

    {
        let mut locked = clients.lock().unwrap();
        locked.push(tx);
    }

    let send_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            let _ = tx_socket.send(Message::text(msg)).await;
        }
    });

    let clients_clone = clients.clone();
    let recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = rx_socket.next().await {
            if msg.is_text() {
                let msg_str = msg.to_str().unwrap();

                let locked = clients_clone.lock().unwrap();
                for client in locked.iter() {
                    let _ = client.send(msg_str.to_string());
                }
            }
        }
    });

    let _ = tokio::join!(send_task, recv_task);
}
