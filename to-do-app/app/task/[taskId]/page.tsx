import { getSingleTask, redirectDashboard } from '@/lib/tasks';
import styles from '@/styles/singleTaskPage.module.css';

export default async function Page({params}: {
  params: Promise<{ taskId: string}>
}) {
  const { taskId } = await params;
  const task = await getSingleTask(taskId);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Task: {task.title}</h1>
        
        <div className={styles.detailsGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <span className={styles.value}>{task.description}</span>
          </div>
          
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <span className={styles.badge}>{task.status}</span>
          </div>
          
          <div className={styles.field}>
            <label className={styles.label}>Priority</label>
            <span className={styles.badge}>{task.priority}</span>
          </div>
          
          <div className={styles.field}>
            <label className={styles.label}>Due Date</label>
            <span className={styles.value}>{task.due_date}</span>
          </div>
          
          <div className={styles.field}>
            <label className={styles.label}>Completed</label>
            <span className={styles.value}>{task.completed ? 'Yes' : 'No'}</span>
          </div>
          
          <div className={styles.field}>
            <label className={styles.label}>Created At</label>
            <span className={styles.value}>{task.created_at}</span>
          </div>
        </div>
        
        <button 
          onClick={redirectDashboard}
          className={styles.button}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  )

}