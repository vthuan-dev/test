interface ChatHeaderProps {
    onClose: () => void;
  }
  
  export const ChatHeader = ({ onClose }: ChatHeaderProps) => {
    return (
      <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <h3 className="font-medium">Hỗ trợ trực tuyến</h3>
        </div>
        <button onClick={onClose} className="hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };