import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash } from 'lucide-react';
import logo from "@/assets/logo.png";
import { db } from "./firebase.js";
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";

export default function ControlePedidosApp() {
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [status, setStatus] = useState('pendente');
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const dados = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPedidos(dados);
    });
    return () => unsubscribe();
  }, []);

  async function adicionarPedido() {
    if (!descricao || !quantidade) return;
    const novoPedido = {
      descricao,
      quantidade: parseInt(quantidade),
      status,
      timestamp: serverTimestamp()
    };
    await addDoc(collection(db, "pedidos"), novoPedido);
    setDescricao('');
    setQuantidade('');
    setStatus('pendente');
  }

  async function removerPedido(id) {
    await deleteDoc(doc(db, "pedidos", id));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-center mb-4">
        <img src={logo} alt="Logo Mundo Nerd" className="h-[60px] w-auto max-w-[160px] object-contain" />
      </div>
      <div className="max-w-3xl mx-auto bg-white/80 rounded-xl p-4 shadow-md">
        <h1 className="text-2xl font-bold mb-4">📦 Controle de Pedidos</h1>

        <Card className="mb-4">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input placeholder="Descrição da peça" value={descricao} onChange={e => setDescricao(e.target.value)} />
            <Input placeholder="Quantidade" type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
            <Input placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} />
            <Button onClick={adicionarPedido}><Plus className="w-4 h-4 mr-2" />Adicionar</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.descricao}</TableCell>
                    <TableCell>{p.quantidade}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => removerPedido(p.id)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pedidos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-400">Nenhum pedido registrado.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
