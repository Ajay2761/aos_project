
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

//   scheduleSRJF() {
//     if (this.jobs.length === 0) {
//       alert("Please add at least one job before scheduling");
//       return;
//     }

//     this.isScheduling = true;
//     this.resetJobStates();
    
//     let time = 0;
//     let completedJobs = 0;
//     let timeline: GanttChartSlot[] = [];
//     let cpuAvailableTimes: number[] = new Array(this.cpuCount).fill(0);
//     let currentlyRunningJobs: (string | null)[] = new Array(this.cpuCount).fill(null);
    
//     while (completedJobs < this.jobs.length) {
//       // Get all jobs that have arrived by current time, have remaining work,
//       // and are not currently running on any CPU
//       let availableJobs = this.jobs
//         .filter(job => 
//           job.arrival <= time && 
//           job.remaining > 0 &&
//           !currentlyRunningJobs.includes(job.id)
//         )
//         .sort((a, b) => a.remaining - b.remaining);

//       let assignedAnyJob = false;

//       // Assign jobs to available CPUs
//       for (let cpu = 0; cpu < this.cpuCount; cpu++) {
//         if (cpuAvailableTimes[cpu] > time) continue; // CPU is busy
        
//         if (availableJobs.length === 0) break;

//         let currentJob = availableJobs.shift()!;
//         let executionTime = Math.min(this.quantum, currentJob.remaining);
//         let startTime = Math.max(time, cpuAvailableTimes[cpu]);
//         let endTime = startTime + executionTime;

//         currentJob.remaining -= executionTime;
//         currentJob.assignedCpu = cpu + 1;
//         cpuAvailableTimes[cpu] = endTime;
//         currentlyRunningJobs[cpu] = currentJob.id; // Mark job as running on this CPU
//         assignedAnyJob = true;

//         if (currentJob.remaining === 0) {
//           completedJobs++;
//           currentJob.completion = endTime;
//           currentJob.turnAround = currentJob.completion - currentJob.arrival;
//           currentJob.waiting = currentJob.turnAround - currentJob.burst;
//           currentlyRunningJobs[cpu] = null; // Clear running job when completed
//         }

//         timeline.push({ job: currentJob.id, cpu: cpu + 1, startTime, endTime });

//         // Remove this job from availableJobs if it exists there (prevent duplicate scheduling)
//         availableJobs = availableJobs.filter(j => j.id !== currentJob.id);
//       }

//       // Clear running jobs that have finished their quantum
//       for (let cpu = 0; cpu < this.cpuCount; cpu++) {
//         if (cpuAvailableTimes[cpu] <= time && currentlyRunningJobs[cpu] !== null) {
//           currentlyRunningJobs[cpu] = null;
//         }
//       }

//       // Calculate next event time
//       const nextTimes = [
//         ...cpuAvailableTimes.filter(t => t > time),
//         ...this.jobs
//           .filter(j => j.arrival > time && j.remaining > 0)
//           .map(j => j.arrival)
//       ];

//       if (nextTimes.length > 0) {
//         time = Math.min(...nextTimes);
//       } else {
//         break;
//       }
//     }

//     this.ganttChart = timeline;
//     this.isScheduling = false;
// }

   // CORRECT TIME PRINTING CODE.
  // scheduleSRJF() {
  //   if (this.jobs.length === 0) {
  //     alert("Please add at least one job before scheduling");
  //     return;
  //   }

  //   this.isScheduling = true;
  //   this.resetJobStates();
    
  //   let time = 0;
  //   let completedJobs = 0;
  //   let timeline: GanttChartSlot[] = [];
  //   let cpuAvailableTimes: number[] = new Array(this.cpuCount).fill(0);
    
  //   while (completedJobs < this.jobs.length) {
  //     let availableJobs = this.jobs
  //       .filter(job => job.arrival <= time && job.remaining > 0)
  //       .sort((a, b) => a.remaining - b.remaining);

  //     let assignedAnyJob = false;

  //     // First, try to assign jobs to CPUs that become available at exactly 'time'
  //     for (let cpu = 0; cpu < this.cpuCount; cpu++) {
  //       if (cpuAvailableTimes[cpu] !== time) continue;
  //       if (availableJobs.length === 0) break;

      //   this.assignJobToCPU(
      //     cpu,
      //     availableJobs.shift()!,
      //     time,
      //     timeline,
      //     cpuAvailableTimes,
      //     () => completedJobs++
      //   );
      //   assignedAnyJob = true;
      // }

      // // Then assign to any available CPUs (including those that became available earlier)
      // for (let cpu = 0; cpu < this.cpuCount; cpu++) {
      //   if (cpuAvailableTimes[cpu] > time) continue;
      //   if (availableJobs.length === 0) break;

      //   this.assignJobToCPU(
      //     cpu,
      //     availableJobs.shift()!,
      //     time,
//           timeline,
//           cpuAvailableTimes,
//           () => completedJobs++
//         );
//         assignedAnyJob = true;
//       }

//       // Calculate next event time
//       const nextTimes = [
//         ...cpuAvailableTimes.filter(t => t > time),
//         ...this.jobs
//           .filter(j => j.arrival > time && j.remaining > 0)
//           .map(j => j.arrival)
//       ];

//       if (nextTimes.length > 0) {
//         time = Math.min(...nextTimes);
//       } else {
//         // Only happens if all jobs are completed
//         break;
//       }
//     }

//     this.ganttChart = timeline;
//     this.isScheduling = false;
// }

// Helper function to assign job to CPU and update all necessary state
// private assignJobToCPU(
//   cpu: number,
//   job: any,
//   currentTime: number,
//   timeline: GanttChartSlot[],
//   cpuAvailableTimes: number[],
//   onCompletion: () => void
// ) {
//   const executionTime = Math.min(this.quantum, job.remaining);
//   const startTime = Math.max(currentTime, cpuAvailableTimes[cpu]);
//   const endTime = startTime + executionTime;

//   job.remaining -= executionTime;
//   job.assignedCpu = cpu + 1;
//   cpuAvailableTimes[cpu] = endTime;

//   if (job.remaining === 0) {
//     job.completion = endTime;
//     job.turnAround = job.completion - job.arrival;
//     job.waiting = job.turnAround - job.burst;
//     onCompletion();
//   }

//   timeline.push({
//     job: job.id,
//     cpu: cpu + 1,
//     startTime,
//     endTime
//   });
// }

// This code has seemingly good time updates logic
//   scheduleSRJF() {
//     if (this.jobs.length === 0) {
//       alert("Please add at least one job before scheduling");
//       return;
//     }

//     this.isScheduling = true;
    
//     // Reset job states
//     this.resetJobStates();
    
//     let time = 0;
//     let completedJobs = 0;
//     let timeline: GanttChartSlot[] = [];
//     let cpuAvailableTimes: number[] = new Array(this.cpuCount).fill(0);
    
//     while (completedJobs < this.jobs.length) {
//       // Get all jobs that have arrived by current time and have remaining work
//       let availableJobs = this.jobs
//         .filter(job => job.arrival <= time && job.remaining > 0)
//         .sort((a, b) => a.remaining - b.remaining);

//       // Assign jobs to available CPUs
//       let assignedJobs = false;
//       for (let cpu = 0; cpu < this.cpuCount; cpu++) {
//         if (cpuAvailableTimes[cpu] > time) continue; // CPU is busy
        
//         if (availableJobs.length === 0) break;

//         let currentJob = availableJobs.shift()!;
//         let executionTime = Math.min(this.quantum, currentJob.remaining);
//         let startTime = Math.max(time, cpuAvailableTimes[cpu]);
//         let endTime = startTime + executionTime;

//         currentJob.remaining -= executionTime;
//         currentJob.assignedCpu = cpu + 1;
//         cpuAvailableTimes[cpu] = endTime;
//         assignedJobs = true;

//         if (currentJob.remaining === 0) {
//           completedJobs++;
//           currentJob.completion = endTime;
//           currentJob.turnAround = currentJob.completion - currentJob.arrival;
//           currentJob.waiting = currentJob.turnAround - currentJob.burst;
//         }

//         timeline.push({ job: currentJob.id, cpu: cpu + 1, startTime, endTime });
//       }

//       // Update time to the next relevant event
//       if (availableJobs.length > 0) {
//         // There are jobs waiting, move to next CPU availability or next arrival
//         time = Math.min(...cpuAvailableTimes, ...this.jobs.filter(j => j.arrival > time).map(j => j.arrival));
//       } else {
//         // No jobs waiting, move to next arrival or CPU availability
//         const nextArrival = Math.min(...this.jobs.filter(j => j.arrival > time).map(j => j.arrival));
//         time = Math.min(nextArrival, ...cpuAvailableTimes);
//       }
      
//       // If all CPUs are busy and no new arrivals, jump to next CPU completion
//       if (!assignedJobs && availableJobs.length === 0) {
//         time = Math.min(...cpuAvailableTimes);
//       }
//     }

//     this.ganttChart = timeline;
//     this.isScheduling = false;
// }

  // WORKING CODE
  // scheduleSRJF() {
  //   if (this.jobs.length === 0) {
  //     alert("Please add at least one job before scheduling");
  //     return;
  //   }

  //   this.isScheduling = true;
    
  //   // Reset job states
  //   this.resetJobStates();
    
  //   let time = 0;
  //   let completedJobs = 0;
  //   let timeline: GanttChartSlot[] = [];
  //   let cpuAvailableTimes: number[] = new Array(this.cpuCount).fill(0);
    
  //   while (completedJobs < this.jobs.length) {
  //     let availableJobs = this.jobs
  //       .filter(job => job.arrival <= time && job.remaining > 0)
  //       .sort((a, b) => a.remaining - b.remaining);

  //     for (let cpu = 0; cpu < this.cpuCount; cpu++) {
  //       if (availableJobs.length === 0) break;

  //       let currentJob = availableJobs.shift()!;
  //       let executionTime = Math.min(this.quantum, currentJob.remaining);
  //       let startTime = Math.max(time, cpuAvailableTimes[cpu]);
  //       let endTime = startTime + executionTime;

  //       currentJob.remaining -= executionTime;
  //       currentJob.assignedCpu = cpu + 1;
  //       cpuAvailableTimes[cpu] = endTime;

  //       if (currentJob.remaining === 0) {
  //         completedJobs++;
  //         currentJob.completion = endTime;
  //         currentJob.turnAround = currentJob.completion - currentJob.arrival;
  //         currentJob.waiting = currentJob.turnAround - currentJob.burst;
  //       }

  //       timeline.push({ job: currentJob.id, cpu: cpu + 1, startTime, endTime });
  //     }

  //     if (availableJobs.length === 0) {
  //       time++;
  //     } else {
  //       time = Math.min(...cpuAvailableTimes);
  //     }
  //     console.log("TIME: ", time, " Completed jobs: ", completedJobs, " Cpu available Times: ", ...cpuAvailableTimes, " availableJobs.length ", availableJobs.length)        
      
  //   }

  //   this.ganttChart = timeline;
  //   this.isScheduling = false;
  // }



//   scheduleSRJF() {
//   if (this.jobs.length === 0) {
//     alert("Please add at least one job before scheduling");
//     return;
//   }

//   this.isScheduling = true;
//   this.resetJobStates();
  
//   let time = 0;
//   let completedJobs = 0;
//   let timeline: GanttChartSlot[] = [];
  
//   // Track currently running jobs on each CPU
//   const runningJobs: (Job | null)[] = new Array(this.cpuCount).fill(null);
//   // Track remaining quantum for each CPU
//   const cpuQuantumRemaining: number[] = new Array(this.cpuCount).fill(0);
  
//   while (completedJobs < this.jobs.length) {
//     // Check for new arrivals at current time
//     const newArrivals = this.jobs.filter(job => 
//       Math.abs(job.arrival - time) < 0.001 && // Account for floating point precision
//       job.remaining === job.burst
//     );
    
//     // Get all available jobs (including new arrivals)
//     let availableJobs = this.jobs
//       .filter(job => job.arrival <= time && job.remaining > 0)
//       .sort((a, b) => a.remaining - b.remaining);

//     // Check for preemption opportunities
//     for (let cpu = 0; cpu < this.cpuCount; cpu++) {
//       const currentJob = runningJobs[cpu];
      
//       if (currentJob && availableJobs.length > 0) {
//         const shortestAvailable = availableJobs[0];
//         if (shortestAvailable.remaining < currentJob.remaining) {
//           // Preempt the current job
//           timeline.push({
//             job: currentJob.id,
//             cpu: cpu + 1,
//             startTime: time - cpuQuantumRemaining[cpu],
//             endTime: time
//           });
//           runningJobs[cpu] = null;
//           cpuQuantumRemaining[cpu] = 0;
//           // Put the preempted job back in available jobs
//           availableJobs.push(currentJob);
//           availableJobs.sort((a, b) => a.remaining - b.remaining);
//         }
//       }
      
//       // Assign new job if CPU is idle
//       if (!runningJobs[cpu] && availableJobs.length > 0) {
//         const nextJob = availableJobs.shift()!;
//         runningJobs[cpu] = nextJob;
//         cpuQuantumRemaining[cpu] = Math.min(this.quantum, nextJob.remaining);
        
//         timeline.push({
//           job: nextJob.id,
//           cpu: cpu + 1,
//           startTime: time,
//           endTime: time + cpuQuantumRemaining[cpu]
//         });
//       }
//     }
    
//     // Advance time by the smallest possible increment (0.1)
//     const timeIncrement = 0.1;
//     time = parseFloat((time + timeIncrement).toFixed(1));
    
//     // Update running jobs
//     for (let cpu = 0; cpu < this.cpuCount; cpu++) {
//       if (runningJobs[cpu]) {
//         const job = runningJobs[cpu]!;
//         job.remaining = parseFloat((job.remaining - timeIncrement).toFixed(1));
//         cpuQuantumRemaining[cpu] = parseFloat((cpuQuantumRemaining[cpu] - timeIncrement).toFixed(1));
        
//         // Check if job completed
//         if (job.remaining <= 0) {
//           job.remaining = 0;
//           job.completion = time;
//           job.turnAround = parseFloat((job.completion - job.arrival).toFixed(1));
//           job.waiting = parseFloat(Math.max(0, job.turnAround - job.burst).toFixed(1)); // Ensure no negative waiting
//           completedJobs++;
//           runningJobs[cpu] = null;
//         }
//         // Check if quantum expired
//         else if (cpuQuantumRemaining[cpu] <= 0) {
//           runningJobs[cpu] = null;
//         }
//       }
//     }
//   }

//   this.ganttChart = timeline;
//   this.isScheduling = false;
// }


  

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
