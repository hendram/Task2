const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Placeholder to store user and rewards data
const users = {};
const rewards = {};
let requestedDate = 0;
let atTime = 0;
let startOfWeek = 0;
let endOfWeek = 0;
let year = 0;
let month = 0;

// Function to generate rewards for a specific week
function generateRewardsForWeek(startDate, endDate, id) {
  const rewardsForWeek = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const availableAt = new Date(currentDate);
    availableAt.toUTCString();
    const expiresAt = new Date(currentDate);
    expiresAt.toUTCString();
    expiresAt.setDate(expiresAt.getDate() + 1);

    rewardsForWeek.push({
      availableAt: availableAt.toISOString().split('T')[0] + 'T00:00:00Z',
      redeemedAt: null,
      expiresAt: expiresAt.toISOString().split('T')[0] + 'T00:00:00Z',
      id: id
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return rewardsForWeek;
}

function requestDate() {
for( let x = 1; x <= requestedDate && x <= 28; x= x+7){
   console.log("value x "  + x); 
    startOfWeek = new Date(atTime);
  startOfWeek.setDate(x); // Find possible first date
  startOfWeek.setMonth(month);
  startOfWeek.setYear(year);
  startOfWeek.setHours(0, 0, 0);
  startOfWeek.toUTCString();
  startOfWeek.setUTCHours(0, 0, 0);


   endOfWeek = new Date(startOfWeek);
   endOfWeek.setDate(startOfWeek.getUTCDate() + 6); // End of the week
  endOfWeek.setMonth(month);
  endOfWeek.setYear(year);
  endOfWeek.setHours(0, 0, 0);
  endOfWeek.toUTCString();
  endOfWeek.setUTCHours(0, 0, 0, 0);

   console.log("endofweek" + endOfWeek.toISOString());

}
}

// Endpoint to get user rewards for a specific date
app.get('/users/:user_id/rewards', (req, res) => {
  const userId = parseInt(req.params.user_id);
  atTime = new Date(req.query.at);
  atTime.toUTCString();
  year = atTime.getUTCFullYear();
  console.log("fucking year" + year);
  month = atTime.getUTCMonth();

  const daysInMonth = new Date(year, month + 1, 0).getUTCDate();
  requestedDate = atTime.getUTCDate();
  console.log("requestDate" + requestedDate);
  startOfMonth = new Date(year, month, 1);
  endOfMonth = new Date(year, month, daysInMonth);

 if(daysInMonth > 28){
  if(requestedDate <= 28) {
   requestDate();
}


else {
   
    startOfWeek = new Date(atTime);
  startOfWeek.setDate(29); // Find beginning of last week
  startOfWeek.setMonth(month);
  startOfWeek.setYear(year);
  startOfWeek.setHours(0, 0, 0);
  startOfWeek.toUTCString();
 startOfWeek.setUTCHours(0, 0, 0, 0);

  
  console.log(startOfWeek);

   endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getUTCDate() + (daysInMonth % 4) - 1); // End of the last week 
  endOfWeek.setMonth(month);
  endOfWeek.setYear(year);
  endOfWeek.setHours(0, 0, 0);
  endOfWeek.toUTCString();
  endOfWeek.setUTCHours(0, 0, 0, 0);
  console.log(endOfWeek.getDate());

}
}

else {
  requestDate();
}

  const startOfWeekStr = startOfWeek.toISOString().split('T')[0] + 'T00:00:00Z';
  console.log(startOfWeekStr);

  // Check if user exists, if not, create a new user
  if (!users[userId]) {
    users[userId] = { id: userId };
  }

  // Check if rewards exist for this week, if not, generate rewards
  if (!rewards[startOfWeekStr]) {
    const rewardsForWeek = generateRewardsForWeek(startOfWeek, endOfWeek, userId);
    rewards[startOfWeekStr] = rewardsForWeek;
  }

console.log(rewards);

  // Return user rewards for the specific week
  res.json({
    data: rewards[startOfWeekStr].map(reward => ({
      availableAt: reward.availableAt.split('T')[0] + 'T00:00:00Z',
      redeemedAt: reward.redeemedAt,
      expiresAt: reward.expiresAt.split('T')[0] + 'T00:00:00Z',
    })),
  });
});


app.patch('/users/:user_id/rewards/:availableAt/redeem', (req, res) => {
  const userId = parseInt(req.params.user_id);
  const pavailableAt = req.params.availableAt;
  const searchAvailableAt = pavailableAt.split('T')[0] + 'T00:00:00Z';  
 
  // Check if the user exists
  if (!users[userId]) {
    return res.status(404).json({ error: { message: 'User not found' } });
  }

let foundKey = null;

 console.log('Rewards:', rewards);
  console.log('Search Available At:', searchAvailableAt);

if(!users[userId]){
       return res.status(404).json({ error: { message: 'User not found' } });
}    

Object.keys(rewards).some(key => {
  const rewardsArray = rewards[key];
  const foundReward = rewardsArray.find(reward => reward.availableAt === searchAvailableAt && reward.id === userId);
  if (foundReward) {
    foundKey = key;
    return true; // Stops the iteration once found
  }
});
 
console.log(foundKey + "foundKey");
 
  const rewardsForWeek = rewards[foundKey];

  if (!rewardsForWeek) {
    return res.status(404).json({ error: { message: 'Reward not found' } });
  }

  const currentTimes = new Date();
  const currentHours = currentTimes.getHours();
  const currentMinutes = currentTimes.getMinutes();
  const currentSeconds = currentTimes.getSeconds();
  console.log(currentSeconds + " shit currentSeconds");
  const currentTimex = currentTimes.toISOString();
  const currentTime = currentTimex.split('T')[0] + 'T' + currentHours + ':' + currentMinutes + ':' + currentSeconds + 'Z';
  console.log(currentTime + "nilai currentTime");

  // Find the specific reward in the week's rewards
  const reward = rewardsForWeek.find(reward => reward.availableAt === searchAvailableAt);

  // Check if the reward's expiresAt has not passed
  if (currentTime <= reward.expiresAt) {
    // Set redeemedAt to the current time
    reward.redeemedAt = currentTime;

    return res.json({
      data: {
        availableAt: reward.availableAt,
        redeemedAt: reward.redeemedAt,
        expiresAt: reward.expiresAt,
      },
    });
  } else {
    return res.status(400).json({
      error: { message: 'This reward is already expired' },
    });
  }
});



// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
