const TaskItem = ({ task, onEdit, onDelete }) => {
    const getStatusClass = () => {
      switch(task.status) {
        case "Pending": return "task-pending";
        case "In Progress": return "task-in-progress";
        case "Completed": return "task-done";
        default: return "";
      }
    };
  
    return (
      <div className={`card ${getStatusClass()} p-4 flex justify-between items-start`}>
        <div>
          <h3 className="font-semibold text-army-dark">{task.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{task.description}</p>
          <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
            task.status === "Completed" ? "bg-green-500 text-white" :
            task.status === "In Progress" ? "bg-blue-500 text-white" :
            "bg-amber-500 text-white"
          }`}>
            {task.status}
          </span>
        </div>
        
        <div className="flex space-x-1">
          <button 
            onClick={() => onEdit(task)} 
            className="p-1.5 rounded-full text-army-dark hover:bg-khaki-300 hover:text-army-green-800 transition-colors"
            title="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(task.id)} 
            className="p-1.5 rounded-full text-army-dark hover:bg-red-100 hover:text-red-600 transition-colors"
            title="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  export default TaskItem;