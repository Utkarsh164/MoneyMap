import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  try {
    const currUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });
    if (currUser) {
      return currUser;
    }
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });
    console.log(newUser);

    return newUser;
  } catch (error) {
    console.log("Erorr in CheckUser", error.message);
  }
};
