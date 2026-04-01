import './styles/global.css';
import LineSelector from './components/LineSelector';
import SlotMachine from './components/SlotMachine';
import ResultCard from './components/ResultCard';
import HistoryChips from './components/HistoryChips';
import { useState } from 'react';

function App() {
  const [selectedLine, setSelectedLine] = useState('rand');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  function handleResult(res) {
    setResult(res);
    setHistory(prev => [res, ...prev].slice(0, 8));
  }

  return (
    <main>
      <h1>🎰 서울 랜덤 데이트</h1>
      <p>호선을 골라서 랜덤 역을 뽑아봐요</p>

      <LineSelector selected={selectedLine} onChange={setSelectedLine} />
      <SlotMachine selectedLine={selectedLine} onResult={handleResult} />
      {result && <ResultCard result={result} />}
      {history.length > 0 && <HistoryChips history={history} />}
    </main>
  );
}

export default App;
