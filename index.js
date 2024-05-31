const { ApolloServer, gql } = require('apollo-server');
const { PubSub } = require('graphql-subscriptions');
const fs = require('fs');

// Carregar dados iniciais
let activities = JSON.parse(fs.readFileSync('./data/activities.json', 'utf8'));
const pubsub = new PubSub();
const ACTIVITY_ADDED = 'ACTIVITY_ADDED';

const typeDefs = gql`
  type Activity {
    id: ID!
    time: String!
    type: String!
    distance: String!
    calories: String!
    bpm: String!
    user: String!
    userImage: String!
    imageUrl: String!
  }

  type Query {
    mockActivities(user: String): [Activity]
  }

  type Mutation {
    addActivity(
      time: String!,
      type: String!,
      distance: String!,
      calories: String!,
      bpm: String!,
      user: String!,
      userImage: String!,
      imageUrl: String!
    ): Activity
  }

  type Subscription {
    activityAdded: Activity
  }
`;

const resolvers = {
  Query: {
    mockActivities: (_, { user }) => {
      console.log("Returning activities for user:", user);
      if (user) {
        return activities.filter(activity => activity.user === user);
      }
      return activities;
    },
  },
  Mutation: {
    addActivity: (_, { time, type, distance, calories, bpm, user, userImage, imageUrl }) => {
      const newActivity = {
        id: activities.length + 1,
        time,
        type,
        distance,
        calories,
        bpm,
        user,
        userImage,
        imageUrl,
      };
      activities.push(newActivity);
      fs.writeFileSync('./data/activities.json', JSON.stringify(activities, null, 2));
      pubsub.publish(ACTIVITY_ADDED, { activityAdded: newActivity });
      return newActivity;
    },
  },
  Subscription: {
    activityAdded: {
      subscribe: () => pubsub.asyncIterator([ACTIVITY_ADDED]),
    },
  },
};

// Servidor Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    path: '/subscriptions',
  },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
