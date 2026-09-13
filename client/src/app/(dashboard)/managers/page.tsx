"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  FileText,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Key,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useGetManagerPropertiesQuery,
} from "@/state/api";

const ManagerDashboard = () => {
  const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery();
  const userId = authUser?.cognitoInfo?.userId;

  const {
    data: managerProperties,
    isLoading: isPropertiesLoading,
  } = useGetManagerPropertiesQuery(userId || "", {
    skip: !userId,
  });

  const {
    data: applications,
    isLoading: isApplicationsLoading,
  } = useGetApplicationsQuery(
    {
      userId: userId,
      userType: "manager",
    },
    {
      skip: !userId,
    }
  );

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const managerName = authUser?.userInfo?.name || "Bibek";

  // Real calculations directly from backend data
  const stats = useMemo(() => {
    const totalProps = managerProperties ? managerProperties.length : 0;

    // A property is rented if it has active leases
    const rentedProps = managerProperties
      ? managerProperties.filter(
        (p: any) => p.leases && p.leases.length > 0
      ).length
      : 0;

    const activeListings = managerProperties
      ? managerProperties.length - rentedProps
      : 0;

    const totalApps = applications ? applications.length : 0;

    const pendingApps = applications
      ? applications.filter(
        (a) => a.status?.toLowerCase() === "pending"
      ).length
      : 0;

    const now = new Date();
    const thisMonthAdded = managerProperties
      ? managerProperties.filter((p: any) => {
        if (!p.postedDate && !p.createdAt) return false;
        const d = new Date(p.postedDate || p.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }).length
      : 0;

    return {
      totalProperties: totalProps,
      addedThisMonth: thisMonthAdded,
      activeListings: activeListings,
      rentedProperties: rentedProps,
      totalApplications: totalApps,
      pendingApplications: pendingApps,
    };
  }, [managerProperties, applications]);

  // Real properties from backend API
  const displayProperties = useMemo(() => {
    if (!managerProperties || managerProperties.length === 0) return [];
    return managerProperties.slice(0, 5).map((prop: any) => {
      const isRented = prop.leases && prop.leases.length > 0;
      return {
        id: prop.id,
        name: prop.name,
        location:
          prop.location?.city || prop.location?.address || "Rental Location",
        price: `$${prop.pricePerMonth?.toLocaleString() || "0"}/mo`,
        status: isRented ? "Rented" : "Available",
        statusColor: isRented
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200",
        photo: prop.photoUrls?.[0] || "/placeholder.jpg",
      };
    });
  }, [managerProperties]);

  // Real applications from backend API
  const displayApplications = useMemo(() => {
    if (!applications || applications.length === 0) return [];
    return applications.slice(0, 5).map((app: any) => ({
      id: app.id,
      applicantName: app.tenant?.name || app.tenant?.email || "Prospective Tenant",
      propertyName: app.property?.name || "Rental Unit",
      date: new Date(app.applicationDate || app.createdAt).toLocaleDateString(
        undefined,
        { month: "short", day: "numeric" }
      ),
      status: app.status || "Pending",
      statusColor:
        app.status?.toLowerCase() === "approved"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : app.status?.toLowerCase() === "denied"
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : "bg-amber-50 text-amber-700 border-amber-200",
    }));
  }, [applications]);

  if (isAuthLoading || isPropertiesLoading || isApplicationsLoading) {
    return <Loading />;
  }

  return (
    <div className="dashboard-container max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-8">
      {/* 1. Header with Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-wrap sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>{greeting}, {managerName}</span>
            <span className="text-xl sm:text-2xl shrink-0">👋</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Manage your rental business from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/managers/properties" scroll={false} className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto h-9 sm:h-10 border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-3 sm:px-4 text-xs sm:text-sm"
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              View Properties
            </Button>
          </Link>
          <Link href="/managers/newproperty" scroll={false} className="flex-1 sm:flex-none">
            <Button
              size="sm"
              className="w-full sm:w-auto h-9 sm:h-10 bg-secondary-600 hover:bg-secondary-700 text-white font-medium shadow-sm px-3 sm:px-4 text-xs sm:text-sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Total Properties */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Total Properties
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary-100 flex items-center justify-center text-primary-700">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {stats.totalProperties}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full w-fit">
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            +{stats.addedThisMonth} this month
          </div>
        </div>

        {/* Card 2: Active Listings */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Active Listings
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Key className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {stats.activeListings}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-blue-600 bg-blue-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full w-fit">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {stats.rentedProperties} rented
          </div>
        </div>

        {/* Card 3: Applications */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-medium text-gray-500">
              Applications
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {stats.totalApplications}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-amber-600 bg-amber-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full w-fit">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {stats.pendingApplications} pending
          </div>
        </div>
      </div>

      {/* 4. Two Main Content Cards: Your Properties & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Your Properties Widget */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Your Properties
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Overview of current property statuses
                </p>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {stats.totalProperties} total
              </span>
            </div>

            {displayProperties.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {displayProperties.map((prop) => (
                  <Link
                    key={prop.id}
                    href={`/managers/properties/${prop.id}`}
                    scroll={false}
                    className="py-3 sm:py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 sm:gap-4 group hover:bg-gray-50/80 px-2 -mx-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-gray-100 relative shrink-0">
                        <Image
                          src={prop.photo}
                          alt={prop.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">
                          {prop.name}
                        </p>
                        <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                          {prop.location} • {prop.price}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${prop.statusColor}`}
                    >
                      {prop.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  No properties found
                </p>
                <p className="text-[11px] sm:text-xs text-gray-400 mb-4 max-w-xs mx-auto">
                  Add your first rental property to start managing listings.
                </p>
                <Link href="/managers/newproperty" scroll={false}>
                  <Button size="sm" className="bg-secondary-600 hover:bg-secondary-700 text-white text-xs sm:text-sm h-8 sm:h-9">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Property
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
            <Link
              href="/managers/properties"
              scroll={false}
              className="w-full"
            >
              <Button
                variant="ghost"
                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold text-xs sm:text-sm h-8 sm:h-9 flex items-center justify-center gap-1.5"
              >
                View All Properties
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Applications Widget */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  Recent Applications
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Tenant inquiries and rental submissions
                </p>
              </div>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                {stats.pendingApplications} pending
              </span>
            </div>

            {displayApplications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {displayApplications.map((app) => (
                  <Link
                    key={app.id}
                    href="/managers/applications"
                    scroll={false}
                    className="py-3 sm:py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 sm:gap-4 group hover:bg-gray-50/80 px-2 -mx-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                        {app.applicantName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">
                          {app.applicantName}
                        </p>
                        <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                          Applied for {app.propertyName} • {app.date}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${app.statusColor}`}
                    >
                      {app.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 sm:py-12 text-center">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  No applications received yet
                </p>
                <p className="text-[11px] sm:text-xs text-gray-400 max-w-xs mx-auto">
                  When tenants submit rental applications, they will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
            <Link
              href="/managers/applications"
              scroll={false}
              className="w-full"
            >
              <Button
                variant="ghost"
                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold text-xs sm:text-sm h-8 sm:h-9 flex items-center justify-center gap-1.5"
              >
                View Applications
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. The Three Operations Cards */}
      <div className="pt-2 sm:pt-4">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Manager Operations
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Direct shortcuts to key property and tenant management tasks
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Section 1: Manage Your Properties */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center mb-3 sm:mb-4">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">
                Manage Your Properties
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4 sm:mb-6">
                Add, edit, and manage all your rental properties from one place.
              </p>
            </div>
            <Link href="/managers/properties" scroll={false}>
              <Button className="w-full bg-primary-700 hover:bg-primary-800 text-white font-medium text-xs sm:text-sm h-9 sm:h-10">
                My Properties
              </Button>
            </Link>
          </div>

          {/* Section 2: Track Your Listings */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 sm:mb-4">
                <Key className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">
                Track Your Listings
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4 sm:mb-6">
                Monitor your active, rented, and available properties.
              </p>
            </div>
            <Link href="/managers/properties" scroll={false}>
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-100 text-gray-800 font-medium text-xs sm:text-sm h-9 sm:h-10"
              >
                View Listings
              </Button>
            </Link>
          </div>

          {/* Section 3: Manage Applications */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 sm:mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">
                Manage Applications
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4 sm:mb-6">
                Review prospective tenants and manage rental applications efficiently.
              </p>
            </div>
            <Link href="/managers/applications" scroll={false}>
              <Button
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-100 text-gray-800 font-medium text-xs sm:text-sm h-9 sm:h-10"
              >
                Applications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
