import { useOverlapApp } from "./useOverlapApp.js";
import { buildViewModel } from "./viewModel.js";
import Header from "./components/Header.jsx";
import SetupPane from "./components/SetupPane.jsx";
import DecidePane from "./components/DecidePane.jsx";
import SchedulePane from "./components/SchedulePane.jsx";
import SettingsPane from "./components/SettingsPane.jsx";
import { ConfirmPreviewModal, VoteCancelConfirmModal, CancelConfirmModal, GcalDisconnectModal, Toast } from "./components/Modals.jsx";

export default function App() {
  const { state, handlers } = useOverlapApp();
  const vm = buildViewModel(state, handlers);

  return (
    <div style={{ fontFamily: "'Pretendard',system-ui,sans-serif", color: "#191F28", background: "#F7F8FA", minHeight: "100vh", padding: "28px clamp(16px,4vw,44px) 60px", lineHeight: 1.5, letterSpacing: "-0.01em", boxSizing: "border-box", overflowX: "hidden" }}>
      <Header vm={vm} />

      {vm.isSetup && <SetupPane vm={vm} />}
      {vm.isDecide && <DecidePane vm={vm} />}
      {vm.isSchedule && <SchedulePane vm={vm} />}
      {vm.isSettings && <SettingsPane vm={vm} />}

      <ConfirmPreviewModal vm={vm} />
      <VoteCancelConfirmModal vm={vm} />
      <CancelConfirmModal vm={vm} />
      <GcalDisconnectModal vm={vm} />
      <Toast vm={vm} />
    </div>
  );
}
