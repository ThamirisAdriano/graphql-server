const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs');

// Carregar dados iniciais
let activities = JSON.parse(fs.readFileSync('./data/activities.json', 'utf8'));

// Esquema GraphQL
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
`;

// Resolvers
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
      // Introduzindo um erro propositalmente para simulação
      throw new Error('Simulated server error');

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
      console.log("Added new activity:", newActivity);
      return newActivity;
    },
  },
};

// Servidor Apollo
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
