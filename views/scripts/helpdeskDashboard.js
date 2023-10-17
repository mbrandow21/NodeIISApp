class Dashboard extends HTMLElement {
  constructor() {
    super();
    this.colors = [
      "#1abc9c",       // Turquoise
      "#f1c40f",       // Yellow
      "#3498db",       // Light Blue
      "#e67e22",       // Orange
      "#e74c3c",       // Red
      "#9b59b6",       // Purple
      "#a29bfe",       // Light Lavender
      "#2ecc71",       // Emerald
      "#d35400",       // Pumpkin
      "#f06292",       // Pink
      "#64b5f6",       // Sky Blue
      "#4db6ac",       // Teal
      "#ff8a65",       // Deep Orange
      "#7986cb"        // Indigo
    ];       
    
    this.defaultGray = "#3a3a3a"; // Dark Gray
    this.titleSize = 24;
    this.charts = [];
    this.timeId = 0;
    this.webSocket;
    this.currTickets = 0;

    this.daysBack = 30;
    this.minDate = new Date().setDate(new Date().getDate() - this.daysBack);
    this.timeLabel = `(Last ${this.daysBack} Days)`

    // notification settings
    this.numOfNotificationSounds = 24;
    this.lastNotification;

    // CHART DEFAULTS
    Chart.defaults.color = '#FFF';

    this.createWebsocket();
    // this.webSocketKeepAlive(60000) //every 60 seconds

    this.update();
  }

  createWebsocket = () => {
    this.socket = io(window.location.origin + '/tickets');
  
    this.socket.on('ticketUpdate', (data) => {
      const { IT_Help_Ticket_ID } = data;
      if (!IT_Help_Ticket_ID) return;

      // console.log('ticket update received');
  
      // Find the index of the ticket with the matching ID
      const ticketIndex = this.allTickets.findIndex(ticket => ticket.IT_Help_Ticket_ID === IT_Help_Ticket_ID);
  
      // If the ticket exists, replace it. Otherwise, add the new ticket to the beginning of the array
      if (ticketIndex !== -1) {
        this.allTickets[ticketIndex] = data;
      } else {
        this.allTickets.unshift(data);
        this.handleNewTicket();
      }
  
      this.currTickets = this.allTickets.filter(ticket => new Date(ticket.Request_Date) > this.minDate);
      this.draw();
      this.scheduleUpdate(); // schedule to update every night at midnight
    });
  }

  uniqueID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  timeDistance(pastDate) {
    const now = new Date();
    const timeDifference = now - pastDate; // This gives time difference in milliseconds
  
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) {
      return days + ` day${days !== 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
      return hours + ` hour${hours !== 1 ? 's' : ''} ago`;
    }
    if (minutes > 0) {
      return minutes + ` minute${minutes !== 1 ? 's' : ''} ago`;
    }
    return 'now';
  }

  handleNewTicket = () => {
    const audio = new Audio(`/assets/ticketNotification.mp3`);
    audio.play();
  }

  scheduleUpdate = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight
  
    const timeUntilTomorrow = tomorrow - now;
  
    setTimeout(() => {
      this.update();
      this.scheduleUpdate(); // schedule the next update
    }, timeUntilTomorrow);
  }

  update = async () => {
    try {
      this.allTickets = await axios({
        method: 'get',
        url: '/api/mp/tickets'
      })
        .then(response => response.data)

      this.currTickets = this.allTickets.filter(ticket => new Date(ticket.Request_Date) > this.minDate);
        
      this.ticketTags = await axios({
        method: 'get',
        url: '/api/mp/ticket-tags'
      })
        .then(response => response.data)

      this.ticketMethods = await axios({
        method: 'get',
        url: '/api/mp/ticket-methods'
      })
        .then(response => response.data)

      this.ticketsByTeam = await axios({
        method: 'get',
        url: `/api/mp/tickets-by-team?daysBack=${this.daysBack}`
      })
        .then(response => response.data)
    } catch (error) {
      return console.log(error)
    }


    this.draw();
  }
  
  draw = () => {
    this.innerHTML = ``;
    this.charts.forEach(chart => chart.destroy());

    this.createChart(this.getTagsPieChart());
    this.createKPI(this.getKPIValues());
    this.createRecentTickets(this.getRecentTickets());
    this.createChart(this.getMethodsPieChart());
    this.createChart(this.getTeamsPieChart());
    this.createChart(this.getResolveTimeChart());
    this.createChart(this.getTicketsOverTimeChart());
  }

  addChartToRow = (elem) => {
    const rows = this.querySelectorAll('.row');
    if (!rows.length) {
      const rowDOM = document.createElement('div')
        rowDOM.classList.add('row');
        rowDOM.appendChild(elem);
        return this.appendChild(rowDOM);
    } 
    rows.forEach((rowDom, i) => {
      if (rowDom.childElementCount < 4) {
        return rowDom.appendChild(elem);
      } else if (i == rows.length-1) {
        // otherwise create new row
        const newRowDOM = document.createElement('div');
          newRowDOM.classList.add('row');
          newRowDOM.appendChild(elem);
          return this.appendChild(newRowDOM);
      } else {
        return;
      }
    })
  }

  createChart = (chartData) => {
    const id = this.uniqueID();
    const chartContainerDOM = document.createElement('div');
      chartContainerDOM.id = id;
      chartContainerDOM.classList.add('chart-container');
    const chartDOM = document.createElement('canvas');
      chartContainerDOM.appendChild(chartDOM);
    this.addChartToRow(chartContainerDOM);


    const chart = new Chart(chartDOM, chartData);
    this.charts.push(chart);
  }

  createKPI = (datasets) => {
    const id = this.uniqueID();
    const chartContainerDOM = document.createElement('div');
      chartContainerDOM.id = id;
      chartContainerDOM.classList.add('kpi-container');
      
    // value - label
    // subtitle
    chartContainerDOM.innerHTML = datasets.map((data, i) => {
      const { value, label, subtitle } = data;
      return `
        <div class="kpi-value" style="color:${this.colors[i]};">
          <h1>${value} ${label}</h1>
          <p>${subtitle}</p>
        </div>
      `
    }).join('');
    this.addChartToRow(chartContainerDOM);
  }

  createRecentTickets = (tickets) => {
    const id = this.uniqueID();
    const ticketsContainerDOM = document.createElement('div');
      ticketsContainerDOM.id = id;
      ticketsContainerDOM.classList.add('recent-tickets-container');

    ticketsContainerDOM.innerHTML = `<h1 class="container-title">Recent Tickets</h1>`
    ticketsContainerDOM.innerHTML += tickets.map((data, i) => {
      const { title, name, description, date } = data;
      // const formattedDescription = description.replace(/\n/g, '<br>'); // Convert newline to <br> for HTML display
      return `
        <div class="recent-ticket" style="color:${this.colors[i]};">
          <h1 class="ticket-title">${title}</h1>
          <div class="ticket-row">
            <p class="ticket-display-name">${name}</p>
            <p class="ticket-time">${this.timeDistance(date)}</p>
          </div>
          <p class="ticket-description">${description}</p>
        </div>
      `
    }).join('');
    this.addChartToRow(ticketsContainerDOM);
  }

  // Tickets Opened/Resolved
  getTicketsOverTimeChart = () => {
    const chartTickets = this.currTickets;
    const daysList = [];

    const date = new Date();
      date.setDate(date.getDate() - (this.daysBack-1));

    for (let i = 0; i < this.daysBack; i ++) {
        daysList.push(date.toLocaleDateString());
        date.setDate(date.getDate() + 1);
    }
    
    const daysOpenTickets = daysList.map(day => chartTickets.filter(ticket => new Date(ticket.Request_Date).toLocaleDateString() == day).length)

    const daysResolvedTickets = daysList.map(day => chartTickets.filter(ticket => new Date(ticket.Resolve_Date).toLocaleDateString() == day && ticket.Status == 3).length)
    
    return {
      type: 'line',
      data: {
        labels: daysList.map(day => new Date(day).toLocaleDateString('en-us', {month: 'short', day: 'numeric'})),
        datasets: [
          { 
            data: daysOpenTickets,
            label: "Tickets Opened",
            borderColor: "#3e95cd",
            fill: false,
            pointRadius: 0,
            tension: .2
          },
          {
            data: daysResolvedTickets,
            label: "Tickets Resolved",
            borderColor: "#2ecc71",
            fill: false,
            pointRadius: 0,
            tension: .2
          }
        ]
      },
      options: {
        scales: {
          y: {
            ticks: {
              stepSize: 1
            },
            beginAtZero: true
          }
        },
        plugins: {
            legend: {
                display: true
            },
            title: {
              display: true,
              text: 'Ticket Opened ' + this.timeLabel,
              font: {
                size: this.titleSize
              }
            }
        },
        responsive:true
      }
    };
  }

  // Tickets Types
  getTagsPieChart = () => {
    const chartTickets = this.currTickets;
    const countByTag = chartTickets.reduce((acc, ticket) => {
      const tag = ticket.Tag || 'Unknown';
      if (!acc[tag]) {
          acc[tag] = 0;
      }
      acc[tag]++;
      return acc;
    }, {});

    this.ticketTags.forEach(ticketTag => {
      const { Tag } = ticketTag;
      if (!countByTag[Tag]) {
        countByTag[Tag] = 0;
      }
    });
    
    // Sort by count (largest to smallest)
    const sortedTags = Object.entries(countByTag)
      .sort((a, b) => a[1] - b[1])
      .reduce((obj, [key, val]) => {
          obj[key] = val;
          return obj;
      }, {});

    const currColors = [...this.colors];
    currColors.splice(Object.keys(sortedTags).indexOf('Unknown'), 0, this.defaultGray);
    
    return {
      type: 'pie',
      data: {
        labels: Object.keys(sortedTags),
        datasets: [{
          label: "# of Tickets",
          backgroundColor: currColors,
          data: Object.values(sortedTags)
        }]
      },
      options: {
        plugins: {
            title: {
              display: true,
              text: 'Ticket Types ' + this.timeLabel,
              font: {
                size: this.titleSize
              }
            }
        },
        responsive:true
      }
    };
  }

  getMethodsPieChart = () => {
    const chartTickets = this.currTickets;
    const countByMethod = chartTickets.reduce((acc, ticket) => {
      const method = ticket.Ticket_Request_Method || 'Unknown';
      if (!acc[method]) {
          acc[method] = 0;
      }
      acc[method]++;
      return acc;
    }, {});

    this.ticketMethods.forEach(ticketMethod => {
      const { Ticket_Request_Method: method } = ticketMethod;
      if (!countByMethod[method]) {
          countByMethod[method] = 0;
      }
    });
    
    // Sort by count (largest to smallest)
    const sortedMethods = Object.entries(countByMethod)
      .sort((a, b) => a[1] - b[1])
      .reduce((obj, [key, val]) => {
          obj[key] = val;
          return obj;
      }, {});

    const currColors = [...this.colors];
    currColors.splice(Object.keys(sortedMethods).indexOf('Unknown'), 0, this.defaultGray);

    return {
      type: 'pie',
      data: {
        labels: Object.keys(sortedMethods),
        datasets: [{
          label: "# of Tickets",
          backgroundColor: currColors,
          data: Object.values(sortedMethods)
        }]
      },
      options: {
        plugins: {
            title: {
              display: true,
              text: 'Ticket Methods ' + this.timeLabel,
              font: {
                size: this.titleSize
              }
            }
        },
        responsive:true
      }
    };
  }

  getTeamsPieChart = () => {
    // Sort by count (largest to smallest)
    const sortedTicketTeams = this.ticketsByTeam
      .filter(team => team.Ticket_Count > 0)
      .sort((a, b) => a.Ticket_Count - b.Ticket_Count);
    const teams = sortedTicketTeams.map(team => team.Team_Name);
    const teamCounts = sortedTicketTeams.map(team => team.Ticket_Count);

    return {
      type: 'pie',
      data: {
        labels:  teams,
        datasets: [{
          label: "# of Tickets",
          backgroundColor: this.colors,
          data: teamCounts
        }]
      },
      options: {
        plugins: {
            title: {
              display: true,
              text: 'Tickets By Team ' + this.timeLabel,
              font: {
                size: this.titleSize
              }
            }
        },
        responsive:true
      }
    };
  }

  getResolveTimeChart = () => {
    const today = new Date();
    const chartTickets = this.allTickets.filter(ticket => new Date(ticket.Resolve_Date).getFullYear() == today.getFullYear() && new Date(ticket.Request_Date).getFullYear() == today.getFullYear());
    const uniqueAgents = [...new Set(chartTickets.filter(ticket => ticket.Agent !== null).map(ticket => ticket.Agent).sort())]
    const resolvedTickets = chartTickets.filter(ticket => ticket.Status == 3 && ticket.Resolve_Date !== null);
    const avgResolveHours = [];
    
    for (const agent of uniqueAgents) {
      const resolutionTimes = resolvedTickets.filter(ticket => ticket.Agent == agent).map(ticket => new Date(ticket.Resolve_Date).getTime() - new Date(ticket.Request_Date).getTime());
      // get average of resolutionTimes, convert to hours, round to 2 decimal points
      const averageHours = Math.round((resolutionTimes.reduce((accum,val)=>accum+val) / resolutionTimes.length) / 1000 / 60 / 60 * 100) / 100;
      avgResolveHours.push(averageHours);
    }
    
    return {
      type: 'bar',
      data: {
        labels: uniqueAgents,
        datasets: [{
          label: "Hours",
          data: avgResolveHours,
          backgroundColor: this.colors,
          borderWidth: 0
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Avg. Ticket Resolve Time YTD (Hrs)',
            font: {
              size: this.titleSize
            }
          },
          legend: {
            display: false
          }
        },
        responsive:true
      }
    }
  }

  getKPIValues = () => {
    const today = new Date();
    const openedToday = this.currTickets.filter(ticket => new Date(ticket.Request_Date).getMonth() == today.getMonth() && new Date(ticket.Request_Date).getDate() == today.getDate()).length;
    const resolvedToday = this.currTickets.filter(ticket => ticket.Status == 3 && new Date(ticket.Resolve_Date).getMonth() == today.getMonth() && new Date(ticket.Resolve_Date).getDate() == today.getDate()).length;
    
    const openedDaysBack = this.currTickets.filter(ticket => new Date(ticket.Request_Date) > new Date(today.getDate() - this.daysBack)).length;
    const resolvedDaysBack = this.currTickets.filter(ticket => ticket.Status == 3 && new Date(ticket.Resolve_Date) > new Date(today.getDate() - this.daysBack)).length;

    const YTDOpen = this.allTickets.filter(ticket => new Date(ticket.Request_Date).getFullYear() == today.getFullYear()).length;
    const YTDResolved = this.allTickets.filter(ticket => ticket.Status == 3 && new Date(ticket.Resolve_Date).getFullYear() == today.getFullYear() ).length;

    return [
      {
        value: openedToday,
        label: 'Ticket' + (openedToday !== 1 ? 's' : ''),
        subtitle: 'Opened Today'
      },
      {
        value: resolvedToday,
        label: 'Ticket' + (resolvedToday !== 1 ? 's' : ''),
        subtitle: 'Resolved Today'
      },
      {
        value: openedDaysBack,
        label: 'Ticket' + (openedDaysBack !== 1 ? 's' : ''),
        subtitle: `Opened Last ${this.daysBack} Days`
      },
      {
        value: resolvedDaysBack,
        label: 'Ticket' + (resolvedDaysBack !== 1 ? 's' : ''),
        subtitle: `Resolved Last ${this.daysBack} Days`
      },
      {
        value: YTDOpen,
        label: 'Ticket' + (YTDOpen !== 1 ? 's' : ''),
        subtitle: 'Opened This Year'
      },
      {
        value: YTDResolved,
        label: 'Ticket' + (YTDResolved !== 1 ? 's' : ''),
        subtitle: 'Resolved This Year'
      },
    ]
  }

  getRecentTickets = () => {
    // get 3 most recent tickets
    const recentTickets = this.currTickets.slice(0, 3);
    return recentTickets.map(ticket => {
      const { Requestor, Request_Title, Description, Request_Date } = ticket;
  
      // Replace <br> and its variants with a newline, then strip all other tags
      const descriptionText = Description
        .replace(/<br\s*\/?>/g, "\n")  // Replace <br> tags with newline
        .replace(/(<([^>]+)>)/g, "");  // Strip all other HTML tags
  
      return {
        title: Request_Title,
        name: Requestor,
        description: descriptionText,
        date: new Date(Request_Date)
      }
    })
  }  
}

customElements.define('helpdesk-dashboard', Dashboard);