import TaskItem from "./TaskItem";

const TaskList = ({ tasks, onEdit, onDelete }) => {
  if (!tasks.length) return <p className="text-center text-gray-500">No tasks available.</p>;

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default TaskList;
