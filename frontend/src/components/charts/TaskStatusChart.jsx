import TaskStatusDistribution from "./TaskStatusDistribution";

function TaskStatusChart({ tasks = [] }) {
  return <TaskStatusDistribution tasks={tasks} />;
}

export default TaskStatusChart;
