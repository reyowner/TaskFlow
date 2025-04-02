import { useState, useEffect } from "react";

const TaskForm = ({ onSubmit, initialData = {}, onCancel }) => {
  const [formData, setFormData] = useState({ title: "", description: "", status: "Pending" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData?.title) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-army-light p-6 rounded-lg shadow-md border border-khaki-300">
      <div>
        <label htmlFor="title" className="block text-army-dark font-medium mb-1">Task Title</label>
        <input 
          type="text" 
          id="title"
          name="title" 
          placeholder="Enter task title" 
          className="form-input" 
          value={formData.title} 
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-army-dark font-medium mb-1">Description</label>
        <textarea 
          id="description"
          name="description" 
          placeholder="Enter task description" 
          className="form-input" 
          value={formData.description} 
          onChange={handleChange}
          rows="3" 
        />
      </div>
      
      <div>
        <label htmlFor="status" className="block text-army-dark font-medium mb-1">Status</label>
        <select 
          id="status"
          name="status" 
          className="form-input" 
          value={formData.status} 
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      
      <div className="flex space-x-2 pt-2">
        <button 
          type="submit" 
          className="btn-primary flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : initialData?.title ? "Update Task" : "Create Task"}
        </button>
        
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;