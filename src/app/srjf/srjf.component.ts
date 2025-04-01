import { Component } from '@angular/core';
interface Job {
  id: string;
  arrival: number;
  burst: number;
  remaining: number;
  completion: number;
  waiting: number;
  turnAround: number;
}

interface GanttChartSlot {
  job: string;
  //time: number;
  startTime: number;
  endTime: number;
}
@Component({
  selector: 'app-srjf',
  templateUrl: './srjf.component.html',
  styleUrls: ['./srjf.component.css']
})
export class SrjfComponent {
  jobs: Job[] = [];
 
  ganttChart: GanttChartSlot[] = [];  
  quantum: number = 1; // Default value


  jobId: string = '';
  arrivalTime: number = 0;
  burstTime: number = 0;

  addJob() {
    if (this.jobId && this.arrivalTime >= 0 && this.burstTime > 0) {
      const newJob: Job = {
        id: this.jobId,
        arrival: this.arrivalTime,
        burst: this.burstTime,
        remaining: this.burstTime,
        completion: 0,
        waiting: 0,
        turnAround: 0
      };
     
      this.jobs = [...this.jobs, newJob];
      this.jobId = '';
      this.arrivalTime = 0;
      this.burstTime = 0;
    
    }
  }
  /*
  
  scheduleSRJF() {
    
     
        let time = 0;
        let completedJobs = 0;
        let jobQueue = [...this.jobs];
        let timeline: GanttChartSlot[] = [];
      
        while (completedJobs < this.jobs.length) {
          let availableJobs = jobQueue
            .filter((job) => job.arrival <= time && job.remaining > 0)
            .sort((a, b) => a.remaining - b.remaining); // SRJF Sorting
      
          if (availableJobs.length > 0) {
            let currentJob = availableJobs[0];
            let executionTime = Math.min(this.quantum, currentJob.remaining); // ✅ Restrict execution to quantum
      
            currentJob.remaining -= executionTime;
            let startTime = time;
            let endTime = time + executionTime;
            time = endTime;
      
            if (currentJob.remaining === 0) {
              completedJobs++;
              currentJob.completion = time;
              currentJob.turnAround = currentJob.completion - currentJob.arrival;
              currentJob.waiting = currentJob.turnAround - currentJob.burst;
            }
      
            timeline.push({ job: currentJob.id, startTime: startTime, endTime: endTime });
          } else {
            timeline.push({ job: 'Idle', startTime: time, endTime: time + 1 });
            time++;
          }
        }
      
        this.ganttChart = timeline;
      
      
    
  }
  */
  scheduleSRJF() {
    alert("Invoked");
    let time = 0;
    let completedJobs = 0;
    let jobQueue = this.jobs.filter(job => job.burst > 0); // Ensure only valid jobs
    let timeline: GanttChartSlot[] = [];
  
    while (completedJobs < jobQueue.length) { // Use jobQueue.length here
      let availableJobs = jobQueue
        .filter((job) => job.arrival <= time && job.remaining > 0)
        .sort((a, b) => a.remaining - b.remaining);
  
      if (availableJobs.length > 0) {
        let currentJob = availableJobs[0];
        let executionTime = Math.min(this.quantum, currentJob.remaining);
  
        currentJob.remaining -= executionTime;
        let startTime = time;
        let endTime = time + executionTime;
        time = endTime;
  
        if (currentJob.remaining === 0) {
          completedJobs++;
          currentJob.completion = time;
          currentJob.turnAround = currentJob.completion - currentJob.arrival;
          currentJob.waiting = currentJob.turnAround - currentJob.burst;
        }
  
        timeline.push({ job: currentJob.id, startTime: startTime, endTime: endTime });
      } else {
        timeline.push({ job: 'Idle', startTime: time, endTime: time + 1 });
        time++;
      }
    }
  
    this.ganttChart = timeline; // Update only when Run Scheduler is clicked
  }
  
  
  

  getTotalWaitingTime() {
    return this.jobs.reduce((sum, job) => sum + job.waiting, 0);
  }

  getTotalTurnAroundTime() {
    return this.jobs.reduce((sum, job) => sum + job.turnAround, 0);
  }

  getAverageWaitingTime() {
    return this.getTotalWaitingTime() / this.jobs.length;
  }

  getAverageTurnAroundTime() {
    return this.getTotalTurnAroundTime() / this.jobs.length;
  }
 
  onClick(jobId: string) {
    // Remove the job from the list
    this.jobs = this.jobs.filter(job => job.id !== jobId);
    this.ganttChart = []; // Reset the Gantt chart
    //this.scheduleSRJF();
  
  }
  
}
