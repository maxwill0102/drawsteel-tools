import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Calculator from "./pages/Calculator";
import Foundry from "./pages/Foundry";
import Vtt from "./pages/Vtt";
import Dice from "./pages/Dice";
import MyEncounters from "./pages/MyEncounters";
import SharedEncounter from "./pages/SharedEncounter";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/encounter-calculator" element={<Calculator />} />
        <Route path="/foundry" element={<Foundry />} />
        <Route path="/vtt" element={<Vtt />} />
        <Route path="/dice" element={<Dice />} />
        <Route path="/encounters" element={<MyEncounters />} />
        <Route path="/e/:slug" element={<SharedEncounter />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
