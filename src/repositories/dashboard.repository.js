const Student = require("../models/Student");
const User = require("../models/User");
const Fee = require("../models/Fee");

// ==============================
// Admin Dashboard
// ==============================

const getAdminDashboard = async () => {

    const today = new Date();

    const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const endOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
    );

    const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const totalStudents =
        await Student.countDocuments({
            isDeleted: false,
        });

    const totalReceptionists =
        await User.countDocuments({
            role: "RECEPTIONIST",
        });

    const totalCollection =
        await Fee.aggregate([
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

    const todayCollection =
        await Fee.aggregate([
            {
                $match: {
                    paymentDate: {
                        $gte: startOfToday,
                        $lt: endOfToday,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

    const monthCollection =
        await Fee.aggregate([
            {
                $match: {
                    paymentDate: {
                        $gte: startOfMonth,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

    const pendingFee = await Student.aggregate([
        {
            $match: {
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$dueFee",
                },
            },
        },
    ]);
    const paidStudents = await Student.countDocuments({
        dueFee: 0,
        isDeleted: false,
    });

    const dueStudents = await Student.countDocuments({
        dueFee: {
            $gt: 0,
        },
        isDeleted: false,
    });

    return {

        totalStudents,

        totalReceptionists,

        totalCollection:
            totalCollection[0]?.total || 0,

        todayCollection:
            todayCollection[0]?.total || 0,

        monthCollection:
            monthCollection[0]?.total || 0,

        pendingFee:
            pendingFee[0]?.total || 0,

        paidStudents,

        dueStudents,

    };

};

const getReceptionistDashboard = async (userId) => {

  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const endOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const todayCollection = await Fee.aggregate([
    {
      $match: {
        collectedBy: userId,
        paymentStatus: "SUCCESS",
        paymentDate: {
          $gte: startOfToday,
          $lt: endOfToday,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const cashCollection = await Fee.aggregate([
    {
      $match: {
        collectedBy: userId,
        paymentStatus: "SUCCESS",
        paymentMode: "CASH",
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const onlineCollection = await Fee.aggregate([
    {
      $match: {
        collectedBy: userId,
        paymentStatus: "SUCCESS",
        paymentMode: "ONLINE",
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const totalTransactions = await Fee.countDocuments({
    collectedBy: userId,
    paymentStatus: "SUCCESS",
  });

  return {
    todayCollection: todayCollection[0]?.total || 0,
    cashCollection: cashCollection[0]?.total || 0,
    onlineCollection: onlineCollection[0]?.total || 0,
    totalTransactions,
  };
};

const paymentModeSummary = async () => {

  return await Fee.aggregate([
    {
      $match: {
        paymentStatus: "SUCCESS",
      },
    },
    {
      $group: {
        _id: "$paymentMode",
        totalAmount: {
          $sum: "$amount",
        },
        totalTransactions: {
          $sum: 1,
        },
      },
    },
  ]);

};

const classWiseCollection = async () => {

  return await Fee.aggregate([
    {
      $lookup: {
        from: "students",
        localField: "student",
        foreignField: "_id",
        as: "student",
      },
    },
    {
      $unwind: "$student",
    },
    {
      $group: {
        _id: "$student.className",
        totalCollection: {
          $sum: "$amount",
        },
        totalTransactions: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

};


const recentTransactions = async () => {
    return await Fee.find({
        paymentStatus: "SUCCESS",
    })
        .populate({
            path: "student",
            select: "studentId name className section mobile",
        })
        .populate({
            path: "collectedBy",
            select: "name role",
        })
        .sort({
            paymentDate: -1,
        })
        .limit(10)
        .lean();
};



const topDueStudents = async () => {

    return await Student.find({
        dueFee: {
            $gt: 0,
        },
        isDeleted: false,
    })
        .select(
            "studentId name className mobile totalFee paidFee dueFee"
        )
        .sort({
            dueFee: -1,
        })
        .limit(10);

};

const monthlyCollection = async () => {

  return await Fee.aggregate([
    {
      $group: {
        _id: {
          year: {
            $year: "$paymentDate",
          },
          month: {
            $month: "$paymentDate",
          },
        },
        total: {
          $sum: "$amount",
        },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

};

module.exports = {
  getAdminDashboard,
  getReceptionistDashboard,
  recentTransactions,
  topDueStudents,
  monthlyCollection,
  paymentModeSummary,
  classWiseCollection,
};