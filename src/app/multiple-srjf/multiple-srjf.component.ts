
import { Component } from '@angular/core';

interface Job {
  id: string;
  arrival: number;
  burst: number;
  remaining: number;
  completion: number;
  waiting: number;
  turnAround: number;
  assignedCpu?: number;
}

interface GanttChartSlot {
  job: string;
  cpu: number;
  startTime: number;
  endTime: number;
}

@Component({
  selector: 'app-multiple-srjf',
  templateUrl: './multiple-srjf.component.html',
  styleUrls: ['./multiple-srjf.component.css']
})
export class MultipleSrjfComponent {
  jobs: Job[] = [];
  ganttChart: GanttChartSlot[] = [];
  cpuCount: number = 1;
  quantum: number = 1;
  jobId: string = '';
  arrivalTime: number = 0;
  burstTime: number = 0;
  isScheduling: boolean = false;

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

  scheduleSRJF() {
    if (this.jobs.length === 0) {
      alert("Please add at least one job before scheduling");
      return;
    }

    this.isScheduling = true;
    this.resetJobStates();
    
    let time = 0;
    let completedJobs = 0;
    let timeline: GanttChartSlot[] = [];
    let cpuAvailableTimes: number[] = new Array(this.cpuCount).fill(0);
    let runningJobs = new Set<string>(); // Tracks jobs currently executing on ANY CPU
    
    while (completedJobs < this.jobs.length) {
      // Release jobs whose quantum just completed
      for (let cpu = 0; cpu < this.cpuCount; cpu++) {
        if (cpuAvailableTimes[cpu] <= time) {
          // Find job that just finished on this CPU
          const finishedJob = timeline.find(
            slot => slot.cpu === cpu + 1 && slot.endTime === time
          );
          if (finishedJob) {
            runningJobs.delete(finishedJob.job);
          }
        }
      }

      // Get all available jobs (arrived, not completed, not currently running)
      const availableJobs = this.jobs
        .filter(job => 
          job.arrival <= time && 
          job.remaining > 0 &&
          !runningJobs.has(job.id))
        .sort((a, b) => a.remaining - b.remaining);

      // Assign jobs to available CPUs
      for (let cpu = 0; cpu < this.cpuCount; cpu++) {
        if (cpuAvailableTimes[cpu] > time || availableJobs.length === 0) continue;
        
        const currentJob = availableJobs.shift()!;
        const executionTime = Math.min(this.quantum, currentJob.remaining);
        const endTime = time + executionTime;

        currentJob.remaining -= executionTime;
        runningJobs.add(currentJob.id);
        cpuAvailableTimes[cpu] = endTime;

        timeline.push({
          job: currentJob.id,
          cpu: cpu + 1,
          startTime: time,
          endTime: endTime
        });

        if (currentJob.remaining === 0) {
          completedJobs++;
          currentJob.completion = endTime;
          currentJob.turnAround = currentJob.completion - currentJob.arrival;
          currentJob.waiting = currentJob.turnAround - currentJob.burst;
          runningJobs.delete(currentJob.id);
        }
      }

      // Move to next important time point
      const nextEventTimes = [
        ...cpuAvailableTimes.filter(t => t > time),
        ...this.jobs
          .filter(j => j.arrival > time && j.remaining > 0)
          .map(j => j.arrival)
      ];
      
      time = nextEventTimes.length > 0 
        ? Math.min(...nextEventTimes)
        : time + 1; // Only if no jobs left (shouldn't happen)
    }

    this.ganttChart = timeline;
    this.isScheduling = false;
}
// Add this method to your MultipleSrjfComponent class
loadExample(exampleNumber: number) {
  this.resetScheduler();
  
  switch (exampleNumber) {
    case 1:
      // Example 1: Simple example with 2 CPUs
      this.cpuCount = 2;
      this.quantum = 2;
      this.jobs = [
        { id: 'P1', arrival: 0, burst: 6, remaining: 6, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P2', arrival: 2, burst: 4, remaining: 4, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P3', arrival: 4, burst: 2, remaining: 2, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P4', arrival: 6, burst: 8, remaining: 8, completion: 0, waiting: 0, turnAround: 0 }
      ];
      break;
      
    case 2:
      // Example 2: More complex example with 3 CPUs
      this.cpuCount = 3;
      this.quantum = 3;
      this.jobs = [
        { id: 'P1', arrival: 0, burst: 5, remaining: 5, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P2', arrival: 1, burst: 3, remaining: 3, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P3', arrival: 2, burst: 8, remaining: 8, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P4', arrival: 3, burst: 6, remaining: 6, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P5', arrival: 4, burst: 4, remaining: 4, completion: 0, waiting: 0, turnAround: 0 }
      ];
      break;
      
    case 3:
      // Example 3: Example with staggered arrivals
      this.cpuCount = 2;
      this.quantum = 1;
      this.jobs = [
        { id: 'P1', arrival: 0, burst: 4, remaining: 4, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P2', arrival: 1, burst: 2, remaining: 2, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P3', arrival: 2, burst: 1, remaining: 1, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P4', arrival: 3, burst: 3, remaining: 3, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P5', arrival: 4, burst: 5, remaining: 5, completion: 0, waiting: 0, turnAround: 0 }
      ];
      break;
  }
}
// Add this method to your MultipleSrjfComponent class
scheduleRR() {
  if (this.jobs.length === 0) {
    alert("Please add at least one job before scheduling");
    return;
  }

  this.isScheduling = true;
  this.resetJobStates();
  
  let time = 0;
  let completedJobs = 0;
  let timeline: GanttChartSlot[] = [];
  let cpuAvailableTimes: number[] = new Array(this.cpuCount).fill(0);
  let jobQueue: Job[] = [];
  let currentJobs: {[cpu: number]: Job | null} = {};
  
  // Initialize current jobs
  for (let cpu = 0; cpu < this.cpuCount; cpu++) {
    currentJobs[cpu] = null;
  }

  while (completedJobs < this.jobs.length) {
    // Add newly arrived jobs to the queue
    const newJobs = this.jobs.filter(
      job => job.arrival === time && job.remaining > 0
    );
    jobQueue.push(...newJobs);

    // Check for completed jobs on each CPU
    for (let cpu = 0; cpu < this.cpuCount; cpu++) {
      if (cpuAvailableTimes[cpu] <= time && currentJobs[cpu]) {
        const job = currentJobs[cpu]!;
        
        // If job completed
        if (job.remaining === 0) {
          job.completion = time;
          job.turnAround = job.completion - job.arrival;
          job.waiting = job.turnAround - job.burst;
          completedJobs++;
          currentJobs[cpu] = null;
        } 
        // If quantum expired but job not completed
        else {
          jobQueue.push(job);
          currentJobs[cpu] = null;
        }
      }
    }

    // Assign jobs to available CPUs
    for (let cpu = 0; cpu < this.cpuCount; cpu++) {
      if (cpuAvailableTimes[cpu] <= time && !currentJobs[cpu] && jobQueue.length > 0) {
        const nextJob = jobQueue.shift()!;
        const executionTime = Math.min(this.quantum, nextJob.remaining);
        
        currentJobs[cpu] = nextJob;
        nextJob.remaining -= executionTime;
        cpuAvailableTimes[cpu] = time + executionTime;

        timeline.push({
          job: nextJob.id,
          cpu: cpu + 1,
          startTime: time,
          endTime: time + executionTime
        });
      }
    }

    // Move time forward
    const nextEventTime = Math.min(
      ...cpuAvailableTimes.filter(t => t > time),
      ...this.jobs
        .filter(j => j.arrival > time && j.remaining > 0)
        .map(j => j.arrival)
    );
    time = nextEventTime !== Infinity ? nextEventTime : time + 1;
  }

  this.ganttChart = timeline;
  this.isScheduling = false;
}

// Add Round Robin examples
loadRRExample(exampleNumber: number) {
  this.resetScheduler();
  
  switch (exampleNumber) {
    case 1:
      // Example 1: Simple RR example with 2 CPUs
      this.cpuCount = 2;
      this.quantum = 2;
      this.jobs = [
        { id: 'P1', arrival: 0, burst: 5, remaining: 5, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P2', arrival: 1, burst: 3, remaining: 3, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P3', arrival: 2, burst: 8, remaining: 8, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P4', arrival: 3, burst: 6, remaining: 6, completion: 0, waiting: 0, turnAround: 0 }
      ];
      break;
      
    case 2:
      // Example 2: RR with different arrival times
      this.cpuCount = 2;
      this.quantum = 3;
      this.jobs = [
        { id: 'P1', arrival: 0, burst: 10, remaining: 10, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P2', arrival: 1, burst: 5, remaining: 5, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P3', arrival: 3, burst: 8, remaining: 8, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P4', arrival: 9, burst: 2, remaining: 2, completion: 0, waiting: 0, turnAround: 0 }
      ];
      break;
      
    case 3:
      // Example 3: RR with 3 CPUs
      this.cpuCount = 3;
      this.quantum = 2;
      this.jobs = [
        { id: 'P1', arrival: 0, burst: 4, remaining: 4, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P2', arrival: 0, burst: 3, remaining: 3, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P3', arrival: 0, burst: 5, remaining: 5, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P4', arrival: 2, burst: 2, remaining: 2, completion: 0, waiting: 0, turnAround: 0 },
        { id: 'P5', arrival: 3, burst: 4, remaining: 4, completion: 0, waiting: 0, turnAround: 0 }
      ];
      break;
  }
}

  

  resetJobStates() {
    this.jobs.forEach(job => {
      job.remaining = job.burst;
      job.completion = 0;
      job.waiting = 0;
      job.turnAround = 0;
    });
  }

  resetScheduler() {
    this.resetJobStates();
    this.ganttChart = [];
  }

  getCpuList(): number[] {
    const cpus = new Set<number>();
    this.ganttChart.forEach(slot => cpus.add(slot.cpu));
    return Array.from(cpus).sort();
  }

  getGanttSlotsForCpu(cpu: number): GanttChartSlot[] {
    return this.ganttChart.filter(slot => slot.cpu === cpu);
  }

  calculateSlotWidth(slot: GanttChartSlot): number {
    const duration = slot.endTime - slot.startTime;
    return duration * 30;
  }

  getSlotColor(jobId: string): string {
    if (jobId === 'Idle') return '#cccccc';
    
    const colors = [
      '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#673AB7',
      '#FF5722', '#009688', '#795548', '#9C27B0', '#3F51B5'
    ];
    const hash = jobId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getTotalWaitingTime(): number {
    return this.jobs.reduce((sum, job) => sum + job.waiting, 0);
  }

  getTotalTurnAroundTime(): number {
    return this.jobs.reduce((sum, job) => sum + job.turnAround, 0);
  }

  getAverageWaitingTime(): number {
    return this.jobs.length > 0 ? this.getTotalWaitingTime() / this.jobs.length : 0;
  }

  getAverageTurnAroundTime(): number {
    return this.jobs.length > 0 ? this.getTotalTurnAroundTime() / this.jobs.length : 0;
  }

  onClick(jobId: string) {
    this.jobs = this.jobs.filter(job => job.id !== jobId);
    this.ganttChart = [];
    this.resetJobStates();
  }
}










// import { Component } from '@angular/core';

// interface Job {
//   id: string;
//   arrival: number;
//   burst: number;
//   remaining: number;
//   completion: number;
//   waiting: number;
//   turnAround: number;
//   assignedCpu?: number; // Track which CPU is handling this job
// }

// interface GanttChartSlot {
//   job: string;
//   cpu: number;
//   startTime: number;
//   endTime: number;
// }

// @Component({
//   selector: 'app-multiple-srjf',
//   templateUrl: './multiple-srjf.component.html',
//   styleUrls: ['./multiple-srjf.component.css']
// })
// export class MultipleSrjfComponent {
//   jobs: Job[] = [];
//   ganttChart: GanttChartSlot[] = [];
//   cpuCount: number = 1; // Default to 1 CPU
//   quantum: number = 1; // Default quantum time
//   jobId: string = '';
//   arrivalTime: number = 0;
//   burstTime: number = 0;

//   addJob() {
//     if (this.jobId && this.arrivalTime >= 0 && this.burstTime > 0) {
//       const newJob: Job = {
//         id: this.jobId,
//         arrival: this.arrivalTime,
//         burst: this.burstTime,
//         remaining: this.burstTime,
//         completion: 0,
//         waiting: 0,
//         turnAround: 0
//       };
//       this.jobs = [...this.jobs, newJob];
//       this.jobId = '';
//       this.arrivalTime = 0;
//       this.burstTime = 0;
//     }
//   }

//   scheduleSRJF() {
//     alert("SRJF Scheduling Invoked");
//     let time = 0;
//     let completedJobs = 0;
//     let jobQueue = [...this.jobs];
//     let timeline: GanttChartSlot[] = [];
//     let cpuAvailableTimes: number[] = new Array(this.cpuCount).fill(0); // Track when each CPU is free

//     while (completedJobs < this.jobs.length) {
//       let availableJobs = jobQueue
//         .filter(job => job.arrival <= time && job.remaining > 0)
//         .sort((a, b) => a.remaining - b.remaining);

//       for (let cpu = 0; cpu < this.cpuCount; cpu++) {
//         if (availableJobs.length === 0) break;

//         let currentJob = availableJobs.shift()!;
//         let executionTime = Math.min(this.quantum, currentJob.remaining);
//         let startTime = Math.max(time, cpuAvailableTimes[cpu]); // Start when CPU is free
//         let endTime = startTime + executionTime;

//         currentJob.remaining -= executionTime;
//         currentJob.assignedCpu = cpu + 1;
//         cpuAvailableTimes[cpu] = endTime; // Update CPU availability

//         if (currentJob.remaining === 0) {
//           completedJobs++;
//           currentJob.completion = endTime;
//           currentJob.turnAround = currentJob.completion - currentJob.arrival;
//           currentJob.waiting = currentJob.turnAround - currentJob.burst;
//         }

//         timeline.push({ job: currentJob.id, cpu: cpu + 1, startTime, endTime });
//       }

//       if (availableJobs.length === 0) {
//         time++;
//       } else {
//         time = Math.min(...cpuAvailableTimes);
//       }
//     }

//     this.ganttChart = timeline;
//   }

//   getTotalWaitingTime() {
//     return this.jobs.reduce((sum, job) => sum + job.waiting, 0);
//   }

//   getTotalTurnAroundTime() {
//     return this.jobs.reduce((sum, job) => sum + job.turnAround, 0);
//   }

//   getAverageWaitingTime() {
//     return this.getTotalWaitingTime() / this.jobs.length || 0;
//   }

//   getAverageTurnAroundTime() {
//     return this.getTotalTurnAroundTime() / this.jobs.length || 0;
//   }

//   onClick(jobId: string) {
//     this.jobs = this.jobs.filter(job => job.id !== jobId);
//     this.ganttChart = [];
//   }
//   // Add these methods to your component class
// getCpuList(): number[] {
//   const cpus = new Set<number>();
//   this.ganttChart.forEach(slot => cpus.add(slot.cpu));
//   return Array.from(cpus).sort();
// }

// getGanttSlotsForCpu(cpu: number): GanttChartSlot[] {
//   return this.ganttChart.filter(slot => slot.cpu === cpu);
// }

// calculateSlotWidth(slot: GanttChartSlot): number {
//   const duration = slot.endTime - slot.startTime;
//   return duration * 30; // Adjust this multiplier to change the scale
// }

// getSlotColor(jobId: string): string {
//   if (jobId === 'Idle') return '#cccccc';
  
//   // Generate a consistent color based on job ID
//   const colors = [
//     '#4285F4', '#EA4335', '#FBBC05', '#34A853', '#673AB7',
//     '#FF5722', '#009688', '#795548', '#9C27B0', '#3F51B5'
//   ];
//   const hash = jobId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//   return colors[hash % colors.length];
// }
// }
