import './globals.css';
import './mobile-overrides.css';
import AIAssistant from './components/AIAssistant';
import CommandPalette from './components/CommandPalette';
import ToastHost from './components/ToastHost';

export const metadata = {
	title: 'MODIT | Build Smarter. Source Faster.',
	description: 'AI-first building material marketplace for Delhi NCR with supplier matching, RFQ workflows and smart procurement.',
};

export default function Layout({ children }) {
	return (
		<html lang="en">
			<body>
				{children}
				<CommandPalette />
				<ToastHost />
				<AIAssistant />
			</body>
		</html>
	);
}
